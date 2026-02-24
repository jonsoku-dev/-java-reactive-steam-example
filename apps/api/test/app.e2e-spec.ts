import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AiController } from '../src/application/controllers/ai.controller';
import { AgentService } from '../src/domain/ai/agent.service';
import { RedTeamService } from '../src/domain/ai/red-team.service';
import { MacroRegimeService } from '../src/domain/ai/macro-regime.service';
import { MarketScraperService } from '../src/infrastructure/scraper/market-scraper.service';
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';

describe('AppController (e2e)', () => {
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
  const mockScraperService = {
    scrape: vi.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        { provide: AgentService, useValue: mockAgentService },
        { provide: RedTeamService, useValue: mockRedTeamService },
        { provide: MacroRegimeService, useValue: mockMacroService },
        { provide: MarketScraperService, useValue: mockScraperService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ai/agent/run (POST)', async () => {
    const mockResult = {
      marketData: 'test data',
      macro: { regime: 'bull', confidence: 90, factors: [], reasoning: '' },
      portfolio: { assets: [], total_value: 100 },
      redTeam: { scenarios: [], overall_risk_score: 10, vulnerabilities: [], recommendations: [] },
    };

    mockAgentService.runAnalysis.mockResolvedValue(mockResult);

    const response = await request(app.getHttpServer())
      .post('/ai/agent/run')
      .send({ marketData: 'test data' })
      .expect(201);

    expect(response.body).toEqual(mockResult);
    expect(mockAgentService.runAnalysis).toHaveBeenCalledWith('test data');
  });
});
