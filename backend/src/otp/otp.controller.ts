import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { OtpService } from "./otp.service";

@Controller("otp")
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post("send")
  async sendOtp(@Body() body: { mobileNumber?: string }) {
    if (!body?.mobileNumber) {
      throw new BadRequestException("mobileNumber is required");
    }
    return this.otpService.sendOtp(body.mobileNumber);
  }

  @Post("verify")
  async verifyOtp(@Body() body: { mobileNumber?: string; otp?: string }) {
    if (!body?.mobileNumber || !body?.otp) {
      throw new BadRequestException("mobileNumber and otp are required");
    }
    return this.otpService.verifyOtp(body.mobileNumber, body.otp);
  }
}
