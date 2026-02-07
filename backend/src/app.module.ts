import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./config/database.module";
import { RedisModule } from "./config/redis.module";
import { HealthModule } from "./health/health.module";
import { FilesModule } from "./files/files.module";
import { OtpModule } from "./otp/otp.module";
import { PrintJobsModule } from "./print-jobs/print-jobs.module";
import { PaymentsModule } from "./payments/payments.module";
import { PrintTokensModule } from "./print-tokens/print-tokens.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RedisModule,
    HealthModule,
    FilesModule,
    OtpModule,
    PrintJobsModule,
    PaymentsModule,
    PrintTokensModule
  ]
})
export class AppModule {}
