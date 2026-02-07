import { Module } from "@nestjs/common";
import { PrintTokensController } from "./print-tokens.controller";
import { PrintTokensService } from "./print-tokens.service";

@Module({
  controllers: [PrintTokensController],
  providers: [PrintTokensService]
})
export class PrintTokensModule {}
