import { Controller, Post, Body } from '@nestjs/common';
import { RedTeamService } from '../../domain/ai/red-team.service';
import { MacroRegimeService } from '../../domain/ai/macro-regime.service';
import { MarketScraperService } from '../../infrastructure/scraper/market-scraper.service';
import { Portfolio, RedTeam, MacroRegime } from '@my-org/shared';

@Controller('ai')
export class AiController {
  constructor(
    private readonly redTeamService: RedTeamService,
    private readonly macroService: MacroRegimeService,
    private readonly scraperService: MarketScraperService,
  ) {}

  @Post('red-team')
  async runRedTeam(@Body() portfolio: Portfolio): Promise<RedTeam> {
    return this.redTeamService.analyze(portfolio);
  }

  @Post('macro-regime')
  async analyzeMacro(@Body() body: { url: string }): Promise<MacroRegime> {
    const marketData = await this.scraperService.scrape(body.url);
    return this.macroService.analyze(marketData);
  }
}
