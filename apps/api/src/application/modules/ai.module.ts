import { Module } from "@nestjs/common";
import { AgentService } from "../../domain/ai/agent.service";
import { MacroRegimeService } from "../../domain/ai/macro-regime.service";
import { PortfolioService } from "../../domain/ai/portfolio.service";
import { RedTeamService } from "../../domain/ai/red-team.service";
import { MarketScraperService } from "../../infrastructure/scraper/market-scraper.service";
import { AiController } from "../controllers/ai.controller";

@Module({
  controllers: [AiController],
  providers: [
    RedTeamService,
    MacroRegimeService,
    PortfolioService,
    MarketScraperService,
    AgentService,
  ],
})
export class AiModule {}
