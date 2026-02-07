import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { promises as fs } from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { randomUUID } from "crypto";
import { Pool } from "pg";
import { PG_POOL } from "../config/database.module";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(process.cwd(), "uploads");

@Injectable()
export class FilesService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async uploadPdf(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("PDF file is required");
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException("PDF exceeds maximum size");
    }

    if (file.mimetype !== "application/pdf") {
      throw new BadRequestException("Only PDF files are allowed");
    }

    if (!file.buffer || !file.buffer.slice(0, 4).toString("utf8").includes("%PDF")) {
      throw new BadRequestException("Invalid PDF file");
    }

    let pageCount = 0;
    try {
      const parsed = await pdfParse(file.buffer);
      pageCount = parsed.numpages || 0;
    } catch (error) {
      throw new BadRequestException("Unable to read PDF");
    }

    if (pageCount < 1) {
      throw new BadRequestException("PDF has no pages");
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const fileId = randomUUID();
    const filename = `${fileId}.pdf`;
    const storagePath = path.join(UPLOAD_DIR, filename);

    await fs.writeFile(storagePath, file.buffer);
    await this.pool.query(
      `INSERT INTO files (id, storage_path, original_name, size_bytes, mime_type, page_count)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [fileId, storagePath, file.originalname, file.size, file.mimetype, pageCount]
    );

    return {
      fileId,
      pageCount
    };
  }
}
