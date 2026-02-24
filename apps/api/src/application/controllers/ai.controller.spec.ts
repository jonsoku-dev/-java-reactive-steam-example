import 'reflect-metadata';
import { AiController } from './ai.controller';
import { RedTeamService } from '../../domain/ai/red-team.service';
import { MacroRegimeService } from '../../domain/ai/macro-regime.service';
import { MarketScraperService } from '../../infrastructure/scraper/market-scraper.service';
import { Portfolio, RedTeam, MacroRegime } from '@my-org/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('AiController', () => {
  let controller: AiController;
  let redTeamService: RedTeamService;
  let macroService: MacroRegimeService;
  let scraperService: MarketScraperService;

  beforeEach(() => {
    // Create mock services
    redTeamService = {
      analyze: vi.fn(),
    } as unknown as RedTeamService;

    macroService = {
      analyze: vi.fn(),
    } as unknown as MacroRegimeService;

    scraperService = {
      scrape: vi.fn(),
    } as unknown as MarketScraperService;

    // Manually inject dependencies to bypass Vitest/esbuild decorator metadata limitations
    controller = new AiController(redTeamService, macroService, scraperService);
  });

  it('should run red team analysis', async () => {
    const portfolio: Portfolio = { assets: [], total_value: 0 };
    const expectedResult = {} as RedTeam;
    vi.spyOn(redTeamService, 'analyze').mockResolvedValue(expectedResult);

    expect(await controller.runRedTeam(portfolio)).toBe(expectedResult);
    expect(redTeamService.analyze).toHaveBeenCalledWith(portfolio);
  });

  it('should run macro analysis', async () => {
    const url = 'http://news.com';
    const scrapedContent = 'Market is good';
    const expectedResult = {} as MacroRegime;

    const mockScrape = vi.spyOn(scraperService, 'scrape');
    mockScrape.mockResolvedValue(scrapedContent);

    const mockAnalyze = vi.spyOn(macroService, 'analyze');
    mockAnalyze.mockResolvedValue(expectedResult);

    expect(await controller.analyzeMacro({ url })).toBe(expectedResult);
    expect(scraperService.scrape).toHaveBeenCalledWith(url);
    expect(macroService.analyze).toHaveBeenCalledWith(scrapedContent);
  });
});
