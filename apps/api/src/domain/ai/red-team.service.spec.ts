import { RunnableLambda } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { type Portfolio, RedTeamSchema } from "@my-org/shared";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RedTeamService } from "./red-team.service";

// Mock ChatOpenAI
vi.mock("@langchain/openai", () => {
  return {
    ChatOpenAI: vi.fn(),
  };
});

describe("RedTeamService", () => {
  let service: RedTeamService;
  let mockWithStructuredOutput: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const MockChatOpenAI = vi.mocked(ChatOpenAI);
    mockWithStructuredOutput = vi.fn();

    // Use Object.create to mimic an instance of ChatOpenAI to satisfy TypeScript strictness
    // without using 'as' casting or 'any'.
    MockChatOpenAI.mockImplementation(() => {
      const mockInstance = Object.create(ChatOpenAI.prototype);
      mockInstance.withStructuredOutput = mockWithStructuredOutput;
      return mockInstance;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [RedTeamService],
    }).compile();

    service = module.get<RedTeamService>(RedTeamService);
  });

  it("should analyze portfolio using gpt-5.2 and return structured data", async () => {
    const mockResult = {
      scenarios: [
        { name: "Market Crash", description: "50% drop", impact_score: 9 },
      ],
      overall_risk_score: 85,
      vulnerabilities: ["High leverage"],
      recommendations: ["Reduce leverage"],
    };

    // Use RunnableLambda to create a valid Runnable structure
    const runnable = RunnableLambda.from(async () => mockResult);

    mockWithStructuredOutput.mockReturnValue(runnable);

    const portfolioData: Portfolio = {
      assets: [{ symbol: "BTC", amount: 10 }],
      total_value: 50000,
    };

    const result = await service.analyze(portfolioData);

    // Verify correct model usage
    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({
      modelName: "gpt-5.2",
      temperature: 0,
    }));

    // Verify structured output schema usage
    expect(mockWithStructuredOutput).toHaveBeenCalledWith(RedTeamSchema);

    expect(result).toEqual(mockResult);
  });

  it("should throw an error if AI analysis fails", async () => {
    const runnable = RunnableLambda.from(async () => {
      throw new Error("AI Service Down");
    });
    mockWithStructuredOutput.mockReturnValue(runnable);

    const portfolioData: Portfolio = {
      assets: [{ symbol: "BTC", amount: 10 }],
      total_value: 50000,
    };

    await expect(service.analyze(portfolioData)).rejects.toThrow(
      "AI Service Down",
    );
  });
});
