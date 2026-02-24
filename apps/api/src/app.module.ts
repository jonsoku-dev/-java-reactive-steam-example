import { Module } from '@nestjs/common';
import { AiModule } from './application/modules/ai.module';

@Module({
  imports: [AiModule],
})
export class AppModule {}
