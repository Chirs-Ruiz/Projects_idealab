import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Pool } from "pg";
import { nanoid } from "nanoid";
import { PG_POOL } from "../config/database.module";
import { PrintJobStatus } from "../entities/print-job.entity";

const TOKEN_TTL_SECONDS = 5 * 60;

@Injectable()
export class PrintTokensService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async generateToken(jobId: string) {
    if (!jobId?.trim()) {
      throw new BadRequestException("jobId is required");
    }

    const jobResult = await this.pool.query(
      `SELECT id, status, kiosk_id
       FROM print_jobs
       WHERE id = $1`,
      [jobId]
    );

    if (jobResult.rowCount === 0) {
      throw new NotFoundException("Job not found");
    }

    const job = jobResult.rows[0];
    if (job.status !== PrintJobStatus.Paid) {
      throw new BadRequestException("Job is not paid");
    }

    const token = nanoid(24);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);

    const result = await this.pool.query(
      `INSERT INTO print_tokens (print_job_id, kiosk_id, token, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [job.id, job.kiosk_id, token, expiresAt]
    );

    return {
      tokenId: result.rows[0].id,
      token,
      expiresAt: expiresAt.toISOString()
    };
  }
}
