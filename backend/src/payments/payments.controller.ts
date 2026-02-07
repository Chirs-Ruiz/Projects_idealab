import { BadRequestException, Body, Controller, Headers, Post, Req } from "@nestjs/common";
import { Request } from "express";
import crypto from "crypto";
import { ConfigService } from "@nestjs/config";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService
  ) {}

  @Post("orders")
  async createOrder(@Body() body: { jobId?: string }) {
    if (!body?.jobId) {
      throw new BadRequestException("jobId is required");
    }
    return this.paymentsService.createOrder(body.jobId);
  }

  @Post("webhook")
  async handleWebhook(@Req() req: Request, @Headers("x-razorpay-signature") signature?: string) {
    const secret = this.configService.get<string>("RAZORPAY_WEBHOOK_SECRET");
    if (!secret) {
      throw new BadRequestException("Webhook secret not configured");
    }

    const body = req.body as Buffer;
    if (!signature || !body) {
      throw new BadRequestException("Missing signature or body");
    }

    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    if (expected !== signature) {
      throw new BadRequestException("Invalid webhook signature");
    }

    const payload = JSON.parse(body.toString("utf8"));
    if (payload?.event !== "payment.captured") {
      return { received: true };
    }

    const orderId = payload?.payload?.payment?.entity?.order_id;
    const paymentId = payload?.payload?.payment?.entity?.id;
    if (!orderId || !paymentId) {
      throw new BadRequestException("Invalid webhook payload");
    }

    await this.paymentsService.markPaidByOrderId(orderId, paymentId);

    return { received: true };
  }
}
