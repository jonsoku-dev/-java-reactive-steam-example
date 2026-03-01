import "reflect-metadata";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AgentService } from "../../domain/ai/agent.service";
import { MarketScraperService } from "../../infrastructure/scraper/market-scraper.service";
import { AnalysisJob } from "./analysis.job";

describe("AnalysisJob", () => {
  let job: AnalysisJob;
  let mockAgentService: { runAnalysis: ReturnType<typeof vi.fn> };
  let mockScraperService: { scrape: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockAgentService = {
      runAnalysis: vi.fn().mockResolvedValue({}),
    };
    mockScraperService = {
      scrape: vi.fn().mockResolvedValue("Scraped market data"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisJob,
        { provide: AgentService, useValue: mockAgentService },
        { provide: MarketScraperService, useValue: mockScraperService },
      ],
    }).compile();

    job = module.get<AnalysisJob>(AnalysisJob);
    // Since decorators might bypass mock injection in some vitest contexts without full app initialization,
    // explicitly assign to ensure the instance uses our mocks for this unit test if DI fails
    Object.assign(job, {
      agentService: mockAgentService,
      scraperService: mockScraperService,
    });
  });

  it("should run scheduled analysis using configured URLs", async () => {
    await job.handleDailyAnalysis();

    // We expect the scraper to be called for the configured URL
    expect(mockScraperService.scrape).toHaveBeenCalled();

    // We expect the agent to be called with the combined scraped data
    expect(mockAgentService.runAnalysis).toHaveBeenCalledWith(
      expect.stringContaining("Scraped market data"),
    );
  });
});
