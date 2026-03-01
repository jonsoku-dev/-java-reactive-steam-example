import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { ChatOpenAI } from '@langchain/openai';
import { PortfolioSchema, MacroRegime } from '@my-org/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RunnableLambda } from '@langchain/core/runnables';

vi.mock('@langchain/openai', () => {
  return {
    ChatOpenAI: vi.fn(),
  };
});

describe('PortfolioService', () => {
  let service: PortfolioService;
  let mockWithStructuredOutput: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const MockChatOpenAI = vi.mocked(ChatOpenAI);
    mockWithStructuredOutput = vi.fn();

    MockChatOpenAI.mockImplementation(() => {
      const mockInstance = Object.create(ChatOpenAI.prototype);
      mockInstance.withStructuredOutput = mockWithStructuredOutput;
      return mockInstance;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioService],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
  });

  it('should generate portfolio using gpt-5.1 based on macro regime', async () => {
    const mockRegime: MacroRegime = {
      regime: 'bull',
      confidence: 85,
      factors: ['Interest rate cut'],
      reasoning: 'Strong employment data',
    };

    const mockPortfolio = {
      assets: [
        { symbol: 'SPY', amount: 70 },
        { symbol: 'QQQ', amount: 30 },
      ],
      total_value: 100000,
    };

    const runnable = RunnableLambda.from(async () => mockPortfolio);
    mockWithStructuredOutput.mockReturnValue(runnable);

    const result = await service.constructPortfolio(mockRegime);

    expect(ChatOpenAI).toHaveBeenCalledWith({
      model: 'gpt-5.1',
      temperature: 0,
    });

    expect(mockWithStructuredOutput).toHaveBeenCalledWith(PortfolioSchema);
    expect(result).toEqual(mockPortfolio);
  });
});
