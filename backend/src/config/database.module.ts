import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";

export const PG_POOL = Symbol("PG_POOL");

@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>("DATABASE_URL");
        if (!connectionString) {
          throw new Error("DATABASE_URL is required");
        }
        return new Pool({ connectionString });
      }
    }
  ],
  exports: [PG_POOL]
})
export class DatabaseModule {}
