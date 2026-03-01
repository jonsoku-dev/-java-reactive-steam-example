import { RunnableLambda } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { MacroRegimeSchema } from "@my-org/shared";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MacroRegimeService } from "./macro-regime.service";

vi.mock("@langchain/openai", () => {
  return {
    ChatOpenAI: vi.fn(),
  };
});

describe("MacroRegimeService", () => {
  let service: MacroRegimeService;
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
      providers: [MacroRegimeService],
    }).compile();

    service = module.get<MacroRegimeService>(MacroRegimeService);
  });

  it("should analyze macro data using gpt-5.1 and return regime", async () => {
    const mockResult = {
      regime: "bull",
      confidence: 85,
      factors: ["Interest rate cut"],
      reasoning: "Strong employment data",
    };

    const runnable = RunnableLambda.from(async () => mockResult);
    mockWithStructuredOutput.mockReturnValue(runnable);

    const result = await service.analyze("Latest employment data shows...");

    expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({
      modelName: "gpt-5.1",
      temperature: 0,
    }));

    expect(mockWithStructuredOutput).toHaveBeenCalledWith(MacroRegimeSchema);
    expect(result).toEqual(mockResult);
  });
});
