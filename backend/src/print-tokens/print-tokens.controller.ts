import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { PrintTokensService } from "./print-tokens.service";

@Controller("print-tokens")
export class PrintTokensController {
  constructor(private readonly printTokensService: PrintTokensService) {}

  @Post()
  async createToken(@Body() body: { jobId?: string }) {
    if (!body?.jobId) {
      throw new BadRequestException("jobId is required");
    }
    return this.printTokensService.generateToken(body.jobId);
  }
}
