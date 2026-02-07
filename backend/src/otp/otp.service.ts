import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomInt } from "crypto";
import { Pool } from "pg";
import { PG_POOL } from "../config/database.module";
import { REDIS_CLIENT } from "../config/redis.module";

const OTP_TTL_SECONDS = 5 * 60;
const MOBILE_REGEX = /^[0-9]{10}$/;
const OTP_REGEX = /^[0-9]{6}$/;

@Injectable()
export class OtpService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(REDIS_CLIENT)
    private readonly redis: {
      get: (key: string) => Promise<string | null>;
      setex: (key: string, ttl: number, value: string) => Promise<unknown>;
      del: (key: string) => Promise<number>;
    }
  ) {}

  async sendOtp(mobileNumber: string) {
    this.assertValidMobile(mobileNumber);

    const otp = String(randomInt(100000, 1000000));
    const key = this.buildOtpKey(mobileNumber);

    await this.redis.setex(key, OTP_TTL_SECONDS, otp);
    await this.pool.query(
      `INSERT INTO customers (mobile_number)
       VALUES ($1)
       ON CONFLICT (mobile_number) DO NOTHING`,
      [mobileNumber]
    );

    return { mobileNumber, expiresInSeconds: OTP_TTL_SECONDS };
  }

  async verifyOtp(mobileNumber: string, otp: string) {
    this.assertValidMobile(mobileNumber);
    if (!OTP_REGEX.test(otp)) {
      throw new BadRequestException("Invalid OTP format");
    }

    const key = this.buildOtpKey(mobileNumber);
    const storedOtp = await this.redis.get(key);
    if (!storedOtp) {
      throw new BadRequestException("OTP expired or not found");
    }

    if (storedOtp !== otp) {
      throw new BadRequestException("Incorrect OTP");
    }

    await this.redis.del(key);

    const result = await this.pool.query(
      `UPDATE customers
       SET is_verified = true, verified_at = now()
       WHERE mobile_number = $1
       RETURNING id`,
      [mobileNumber]
    );

    if (result.rowCount === 0) {
      throw new NotFoundException("Customer not found");
    }

    return { mobileNumber, verified: true };
  }

  private buildOtpKey(mobileNumber: string) {
    return `otp:${mobileNumber}`;
  }

  private assertValidMobile(mobileNumber: string) {
    if (!MOBILE_REGEX.test(mobileNumber)) {
      throw new BadRequestException("Invalid mobile number");
    }
  }
}
