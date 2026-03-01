import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { AiController } from "../src/application/controllers/ai.controller";
import { AgentService } from "../src/domain/ai/agent.service";
import { MacroRegimeService } from "../src/domain/ai/macro-regime.service";
import { PortfolioService } from "../src/domain/ai/portfolio.service";
import { RedTeamService } from "../src/domain/ai/red-team.service";
import { REDIS_CLIENT } from "../src/infrastructure/cache/cache.module";
import { DRIZZLE } from "../src/infrastructure/database/database.module";
import { MarketScraperService } from "../src/infrastructure/scraper/market-scraper.service";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  // Create mock objects
  const mockAgentService = {
    runAnalysis: vi.fn(),
  };
  const mockRedTeamService = {
    analyze: vi.fn(),
  };
  const mockMacroService = {
    analyze: vi.fn(),
  };
  const mockPortfolioService = {
    constructPortfolio: vi.fn(),
  };
  const mockScraperService = {
    scrape: vi.fn(),
  };

  beforeAll(async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      }),
    };

    const mockRedis = {
      get: vi.fn().mockResolvedValue(null),
      setex: vi.fn().mockResolvedValue("OK"),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        { provide: AgentService, useValue: mockAgentService },
        { provide: RedTeamService, useValue: mockRedTeamService },
        { provide: MacroRegimeService, useValue: mockMacroService },
        { provide: PortfolioService, useValue: mockPortfolioService },
        { provide: MarketScraperService, useValue: mockScraperService },
        { provide: DRIZZLE, useValue: mockDb },
        { provide: REDIS_CLIENT, useValue: mockRedis },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/ai/agent/run (POST)", async () => {
    const mockResult = {
      marketData: "test data",
      macro: { regime: "bull", confidence: 90, factors: [], reasoning: "" },
      portfolio: { assets: [], total_value: 100 },
      redTeam: {
        scenarios: [],
        overall_risk_score: 10,
        vulnerabilities: [],
        recommendations: [],
      },
    };

    mockAgentService.runAnalysis.mockResolvedValue(mockResult);

    const response = await request(app.getHttpServer())
      .post("/ai/agent/run")
      .send({ marketData: "test data" })
      .expect(201);

    expect(response.body).toEqual(mockResult);
    expect(mockAgentService.runAnalysis).toHaveBeenCalledWith("test data");
  });
});
