import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { RedTeamService } from './red-team.service';
import { MacroRegimeService } from './macro-regime.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MacroRegime, RedTeam, Portfolio } from '@my-org/shared';

describe('AgentService (LangGraph)', () => {
  let service: AgentService;
  let redTeamService: RedTeamService;
  let macroService: MacroRegimeService;

  beforeEach(() => {
    redTeamService = {
      analyze: vi.fn(),
    } as unknown as RedTeamService;

    macroService = {
      analyze: vi.fn(),
    } as unknown as MacroRegimeService;

    service = new AgentService(macroService, redTeamService);
  });

  it('should execute full analysis pipeline', async () => {
    const mockMacro: MacroRegime = {
      regime: 'bull',
      confidence: 90,
      factors: ['growth'],
      reasoning: 'good',
    };

    const mockRedTeam: RedTeam = {
      scenarios: [],
      overall_risk_score: 20,
      vulnerabilities: [],
      recommendations: [],
    };

    vi.spyOn(macroService, 'analyze').mockResolvedValue(mockMacro);
    vi.spyOn(redTeamService, 'analyze').mockResolvedValue(mockRedTeam);

    const result = await service.runAnalysis('market data');

    expect(macroService.analyze).toHaveBeenCalledWith('market data');
    // We expect portfolio construction logic to happen (mocked inside service for now)
    // Then red team analysis on the constructed portfolio
    expect(redTeamService.analyze).toHaveBeenCalled();

    expect(result).toEqual({
      marketData: 'market data',
      macro: mockMacro,
      portfolio: expect.anything(),
      redTeam: mockRedTeam,
    });
  });
});
