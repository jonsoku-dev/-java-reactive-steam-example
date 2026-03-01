import {
  analysisResults,
  type MacroRegime,
  type Portfolio,
  type RedTeam,
} from "@my-org/shared";
import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { desc } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { AgentService } from "../../domain/ai/agent.service";
import type { MacroRegimeService } from "../../domain/ai/macro-regime.service";
import type { RedTeamService } from "../../domain/ai/red-team.service";
import { DRIZZLE } from "../../infrastructure/database/database.module";
import type { MarketScraperService } from "../../infrastructure/scraper/market-scraper.service";

@Controller("ai")
export class AiController {
  constructor(
    private readonly redTeamService: RedTeamService,
    private readonly macroService: MacroRegimeService,
    private readonly scraperService: MarketScraperService,
    // Add explicit injection decorator just in case, though it shouldn't be strictly necessary if standard DI works
    @Inject(AgentService) private readonly agentService: AgentService,
    @Inject(DRIZZLE) private readonly db: MySql2Database<Record<string, never>>,
  ) {}

  @Post("red-team")
  async runRedTeam(@Body() portfolio: Portfolio): Promise<RedTeam> {
    return this.redTeamService.analyze(portfolio);
  }

  @Post("macro-regime")
  async analyzeMacro(@Body() body: { url: string }): Promise<MacroRegime> {
    const marketData = await this.scraperService.scrape(body.url);
    return this.macroService.analyze(marketData);
  }

  @Post("agent/run")
  async runAgent(@Body() body: { marketData: string }) {
    if (!this.agentService) {
      throw new Error("AgentService is not initialized");
    }
    return this.agentService.runAnalysis(body.marketData);
  }

  @Get("history")
  async getHistory() {
    return this.db
      .select()
      .from(analysisResults)
      .orderBy(desc(analysisResults.createdAt))
      .limit(10);
  }
}
