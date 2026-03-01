import { RunnableLambda } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { type MacroRegime, PortfolioSchema } from "@my-org/shared";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PortfolioService } from "./portfolio.service";

vi.mock("@langchain/openai", () => {
  return {
    ChatOpenAI: vi.fn(),
  };
});

describe("PortfolioService", () => {
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

  it("should generate portfolio using gpt-5.1 based on macro regime", async () => {
    const mockRegime: MacroRegime = {
      regime: "bull",
      confidence: 85,
      factors: ["Interest rate cut"],
      reasoning: "Strong employment data",
    };

    const mockPortfolio = {
      assets: [
        { symbol: "SPY", amount: 70 },
        { symbol: "QQQ", amount: 30 },
      ],
      total_value: 100000,
    };

    const runnable = RunnableLambda.from(async () => mockPortfolio);
    mockWithStructuredOutput.mockReturnValue(runnable);

    const result = await service.constructPortfolio(mockRegime);

    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({
      modelName: "gpt-5.1",
      temperature: 0,
    }));

    expect(mockWithStructuredOutput).toHaveBeenCalledWith(PortfolioSchema);
    expect(result).toEqual(mockPortfolio);
  });
});
