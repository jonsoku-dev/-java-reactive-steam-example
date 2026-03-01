import "reflect-metadata";
import type { MacroRegime, Portfolio, RedTeam } from "@my-org/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AgentService } from "../../domain/ai/agent.service";
import type { MacroRegimeService } from "../../domain/ai/macro-regime.service";
import type { RedTeamService } from "../../domain/ai/red-team.service";
import type { MarketScraperService } from "../../infrastructure/scraper/market-scraper.service";
import { AiController } from "./ai.controller";

describe("AiController", () => {
  let controller: AiController;
  let redTeamService: RedTeamService;
  let macroService: MacroRegimeService;
  let scraperService: MarketScraperService;
  let agentService: AgentService;

  let mockDb: { select: ReturnType<typeof vi.fn> };

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

    agentService = {
      runAnalysis: vi.fn(),
    } as unknown as AgentService;

    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    // Manually inject dependencies
    controller = new AiController(
      redTeamService,
      macroService,
      scraperService,
      agentService,
      mockDb as any,
    );
  });

  it("should run red team analysis", async () => {
    const portfolio: Portfolio = { assets: [], total_value: 0 };
    const expectedResult = {} as RedTeam;
    vi.spyOn(redTeamService, "analyze").mockResolvedValue(expectedResult);

    expect(await controller.runRedTeam(portfolio)).toBe(expectedResult);
    expect(redTeamService.analyze).toHaveBeenCalledWith(portfolio);
  });

  it("should run macro analysis", async () => {
    const url = "http://news.com";
    const scrapedContent = "Market is good";
    const expectedResult = {} as MacroRegime;

    const mockScrape = vi.spyOn(scraperService, "scrape");
    mockScrape.mockResolvedValue(scrapedContent);

    const mockAnalyze = vi.spyOn(macroService, "analyze");
    mockAnalyze.mockResolvedValue(expectedResult);

    expect(await controller.analyzeMacro({ url })).toBe(expectedResult);
    expect(scraperService.scrape).toHaveBeenCalledWith(url);
    expect(macroService.analyze).toHaveBeenCalledWith(scrapedContent);
  });

  it("should run agent analysis", async () => {
    const marketData = "data";
    const expectedResult = { marketData };
    vi.spyOn(agentService, "runAnalysis").mockResolvedValue(expectedResult);

    expect(await controller.runAgent({ marketData })).toBe(expectedResult);
    expect(agentService.runAnalysis).toHaveBeenCalledWith(marketData);
  });

  it("should fetch history", async () => {
    const result = await controller.getHistory();
    expect(result).toEqual([]);
    expect(mockDb.select).toHaveBeenCalled();
  });
});
