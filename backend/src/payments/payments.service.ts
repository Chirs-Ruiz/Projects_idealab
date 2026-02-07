import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import Razorpay from "razorpay";
import { PG_POOL } from "../config/database.module";
import { PrintJobStatus } from "../entities/print-job.entity";
import { PaymentStatus } from "../entities/payment.entity";

@Injectable()
export class PaymentsService {
  private readonly razorpay: Razorpay;

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly configService: ConfigService
  ) {
    const keyId = this.configService.get<string>("RAZORPAY_KEY_ID");
    const keySecret = this.configService.get<string>("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) {
      throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required");
    }
    this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  async createOrder(jobId: string) {
    if (!jobId?.trim()) {
      throw new BadRequestException("jobId is required");
    }

    const jobResult = await this.pool.query(
      `SELECT id, status, amount_paise FROM print_jobs WHERE id = $1`,
      [jobId]
    );
    if (jobResult.rowCount === 0) {
      throw new NotFoundException("Job not found");
    }

    const job = jobResult.rows[0];
    if (job.status !== PrintJobStatus.ReviewReady) {
      throw new BadRequestException("Job not ready for payment");
    }

    const amount = Number(job.amount_paise);
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException("Invalid job amount");
    }

    const order = await this.razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: jobId
    });

    await this.pool.query(
      `INSERT INTO payments (print_job_id, provider, provider_order_id, amount_paise, status)
       VALUES ($1, 'razorpay', $2, $3, $4)`,
      [jobId, order.id, amount, PaymentStatus.Created]
    );

    return {
      orderId: order.id,
      amount,
      currency: order.currency
    };
  }

  async markPaidByOrderId(orderId: string, paymentId: string) {
    if (!orderId || !paymentId) {
      throw new BadRequestException("orderId and paymentId are required");
    }

    const result = await this.pool.query(
      `UPDATE payments
       SET provider_payment_id = $1, status = $2
       WHERE provider_order_id = $3
       RETURNING print_job_id`,
      [paymentId, PaymentStatus.Captured, orderId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundException("Payment order not found");
    }

    await this.pool.query(
      `UPDATE print_jobs
       SET status = $1
       WHERE id = $2`,
      [PrintJobStatus.Paid, result.rows[0].print_job_id]
    );
  }
}
