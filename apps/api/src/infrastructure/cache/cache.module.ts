import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Redis from "ioredis";

export const REDIS_CLIENT = Symbol("redis-client");

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>(
          "REDIS_URL",
          "redis://localhost:6379",
        );
        return new Redis(redisUrl);
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class CacheModule {}
