import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

export const REDIS_CLIENT = Symbol("REDIS_CLIENT");

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>("REDIS_URL");
        if (!redisUrl) {
          throw new Error("REDIS_URL is required");
        }
        return new Redis(redisUrl);
      }
    }
  ],
  exports: [REDIS_CLIENT]
})
export class RedisModule {}
