import { Module } from '@nestjs/common';
import { AiController } from '../controllers/ai.controller';
import { RedTeamService } from '../../domain/ai/red-team.service';
import { MacroRegimeService } from '../../domain/ai/macro-regime.service';
import { MarketScraperService } from '../../infrastructure/scraper/market-scraper.service';
import { AgentService } from '../../domain/ai/agent.service';
import { PortfolioService } from '../../domain/ai/portfolio.service';

@Module({
  controllers: [AiController],
  providers: [RedTeamService, MacroRegimeService, PortfolioService, MarketScraperService, AgentService],
})
export class AiModule {}
