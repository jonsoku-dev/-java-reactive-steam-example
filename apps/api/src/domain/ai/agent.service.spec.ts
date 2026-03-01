import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { RedTeamService } from './red-team.service';
import { MacroRegimeService } from './macro-regime.service';
import { PortfolioService } from './portfolio.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MacroRegime, RedTeam, Portfolio } from '@my-org/shared';

describe('AgentService (LangGraph)', () => {
  let service: AgentService;
  let redTeamService: RedTeamService;
  let macroService: MacroRegimeService;
  let portfolioService: PortfolioService;

  beforeEach(() => {
    redTeamService = {
      analyze: vi.fn(),
    } as unknown as RedTeamService;

    macroService = {
      analyze: vi.fn(),
    } as unknown as MacroRegimeService;

    portfolioService = {
      constructPortfolio: vi.fn(),
    } as unknown as PortfolioService;

    service = new AgentService(macroService, portfolioService, redTeamService);
  });

  it('should execute full analysis pipeline', async () => {
    const mockMacro: MacroRegime = {
      regime: 'bull',
      confidence: 90,
      factors: ['growth'],
      reasoning: 'good',
    };

    const mockPortfolio: Portfolio = {
      assets: [{ symbol: 'AAPL', amount: 100 }],
      total_value: 15000,
    };

    const mockRedTeam: RedTeam = {
      scenarios: [],
      overall_risk_score: 20,
      vulnerabilities: [],
      recommendations: [],
    };

    vi.spyOn(macroService, 'analyze').mockResolvedValue(mockMacro);
    vi.spyOn(portfolioService, 'constructPortfolio').mockResolvedValue(mockPortfolio);
    vi.spyOn(redTeamService, 'analyze').mockResolvedValue(mockRedTeam);

    const result = await service.runAnalysis('market data');

    expect(macroService.analyze).toHaveBeenCalledWith('market data');
    expect(portfolioService.constructPortfolio).toHaveBeenCalledWith(mockMacro);
    expect(redTeamService.analyze).toHaveBeenCalledWith(mockPortfolio);

    expect(result).toEqual({
      marketData: 'market data',
      macro: mockMacro,
      portfolio: expect.anything(),
      redTeam: mockRedTeam,
    });
  });
});
