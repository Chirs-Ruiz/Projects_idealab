import { BadRequestException, Body, Controller, Param, Patch, Post } from "@nestjs/common";
import { PrintJobsService } from "./print-jobs.service";

@Controller("print-jobs")
export class PrintJobsController {
  constructor(private readonly printJobsService: PrintJobsService) {}

  @Post()
  async createJob(
    @Body()
    body: {
      mobileNumber?: string;
      kioskCode?: string;
      fileId?: string;
      copies?: number;
      ratePaise?: number;
    }
  ) {
    if (
      !body?.mobileNumber ||
      !body?.kioskCode ||
      !body?.fileId ||
      body.copies === undefined ||
      body.ratePaise === undefined
    ) {
      throw new BadRequestException("mobileNumber, kioskCode, fileId, copies, ratePaise are required");
    }

    return this.printJobsService.createJob({
      mobileNumber: body.mobileNumber,
      kioskCode: body.kioskCode,
      fileId: body.fileId,
      copies: Number(body.copies),
      ratePaise: Number(body.ratePaise)
    });
  }

  @Patch(":id")
  async updateJob(
    @Param("id") id: string,
    @Body()
    body: {
      copies?: number;
      ratePaise?: number;
    }
  ) {
    if (body?.copies === undefined && body?.ratePaise === undefined) {
      throw new BadRequestException("copies or ratePaise is required");
    }

    return this.printJobsService.updateJob(id, {
      copies: body?.copies === undefined ? undefined : Number(body.copies),
      ratePaise: body?.ratePaise === undefined ? undefined : Number(body.ratePaise)
    });
  }
}
