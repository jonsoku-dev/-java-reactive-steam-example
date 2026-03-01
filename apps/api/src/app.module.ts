import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AnalysisJob } from "./application/jobs/analysis.job";
import { AiModule } from "./application/modules/ai.module";
import { CacheModule } from "./infrastructure/cache/cache.module";
import { DatabaseModule } from "./infrastructure/database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    CacheModule,
    AiModule,
  ],
  providers: [AnalysisJob],
})
export class AppModule {}
