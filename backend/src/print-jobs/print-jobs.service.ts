import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Pool } from "pg";
import { PG_POOL } from "../config/database.module";
import { PrintJobStatus } from "../entities/print-job.entity";

const MOBILE_REGEX = /^[0-9]{10}$/;

@Injectable()
export class PrintJobsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async createJob(input: {
    mobileNumber: string;
    kioskCode: string;
    fileId: string;
    copies: number;
    ratePaise: number;
  }) {
    this.assertValidMobile(input.mobileNumber);
    if (!input.kioskCode?.trim()) {
      throw new BadRequestException("kioskCode is required");
    }
    if (!input.fileId?.trim()) {
      throw new BadRequestException("fileId is required");
    }
    if (!Number.isInteger(input.copies) || input.copies < 1) {
      throw new BadRequestException("copies must be a positive integer");
    }
    if (!Number.isInteger(input.ratePaise) || input.ratePaise < 1) {
      throw new BadRequestException("ratePaise must be a positive integer");
    }

    const customerResult = await this.pool.query(
      `SELECT id, is_verified FROM customers WHERE mobile_number = $1`,
      [input.mobileNumber]
    );

    if (customerResult.rowCount === 0) {
      throw new NotFoundException("Customer not found");
    }

    if (!customerResult.rows[0].is_verified) {
      throw new BadRequestException("Mobile number not verified");
    }

    const kioskResult = await this.pool.query(`SELECT id FROM kiosks WHERE code = $1`, [input.kioskCode]);
    if (kioskResult.rowCount === 0) {
      throw new NotFoundException("Kiosk not found");
    }

    const fileResult = await this.pool.query(`SELECT page_count FROM files WHERE id = $1`, [input.fileId]);
    if (fileResult.rowCount === 0) {
      throw new NotFoundException("File not found");
    }

    const pageCount = Number(fileResult.rows[0].page_count);
    const amountPaise = pageCount * input.copies * input.ratePaise;

    const jobResult = await this.pool.query(
      `INSERT INTO print_jobs (kiosk_id, customer_id, file_id, status, copies, amount_paise, rate_paise)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, status`,
      [
        kioskResult.rows[0].id,
        customerResult.rows[0].id,
        input.fileId,
        PrintJobStatus.ReviewReady,
        input.copies,
        amountPaise,
        input.ratePaise
      ]
    );

    return {
      jobId: jobResult.rows[0].id,
      status: jobResult.rows[0].status,
      pageCount,
      copies: input.copies,
      ratePaise: input.ratePaise,
      amountPaise
    };
  }

  async updateJob(
    jobId: string,
    updates: {
      copies?: number;
      ratePaise?: number;
    }
  ) {
    if (!jobId?.trim()) {
      throw new BadRequestException("jobId is required");
    }

    const jobResult = await this.pool.query(
      `SELECT status, file_id, copies, rate_paise FROM print_jobs WHERE id = $1`,
      [jobId]
    );
    if (jobResult.rowCount === 0) {
      throw new NotFoundException("Job not found");
    }

    if (jobResult.rows[0].status === PrintJobStatus.ReviewReady) {
      throw new BadRequestException("Job is locked for review");
    }

    if (updates.copies !== undefined && (!Number.isInteger(updates.copies) || updates.copies < 1)) {
      throw new BadRequestException("copies must be a positive integer");
    }

    if (updates.ratePaise !== undefined && (!Number.isInteger(updates.ratePaise) || updates.ratePaise < 1)) {
      throw new BadRequestException("ratePaise must be a positive integer");
    }

    const fileResult = await this.pool.query(`SELECT page_count FROM files WHERE id = $1`, [jobResult.rows[0].file_id]);
    if (fileResult.rowCount === 0) {
      throw new NotFoundException("File not found");
    }

    const pageCount = Number(fileResult.rows[0].page_count);
    const copies = updates.copies ?? jobResult.rows[0].copies ?? 1;
    const ratePaise = updates.ratePaise ?? jobResult.rows[0].rate_paise ?? 0;
    const amountPaise = pageCount * copies * ratePaise;

    const result = await this.pool.query(
      `UPDATE print_jobs
       SET copies = $1, rate_paise = $2, amount_paise = $3
       WHERE id = $4
       RETURNING id`,
      [copies, ratePaise, amountPaise, jobId]
    );

    return {
      jobId: result.rows[0].id,
      pageCount,
      copies,
      ratePaise,
      amountPaise
    };
  }

  private assertValidMobile(mobileNumber: string) {
    if (!MOBILE_REGEX.test(mobileNumber)) {
      throw new BadRequestException("Invalid mobile number");
    }
  }
}
