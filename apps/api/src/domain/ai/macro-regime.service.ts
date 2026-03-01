import { ChatOpenAI as BaseChatOpenAI } from "@langchain/openai";
import { type MacroRegime, MacroRegimeSchema } from "@my-org/shared";
import { Injectable, Logger } from "@nestjs/common";

// Workaround for strict typing: LangChain's ChatOpenAI type definitions can be flaky with 'withStructuredOutput'
// We define an interface that explicitly types the expected method without using 'any'.
interface StructuredChatModel {
  withStructuredOutput(schema: typeof MacroRegimeSchema): {
    invoke(prompt: string): Promise<MacroRegime>;
  };
}

@Injectable()
export class MacroRegimeService {
  private readonly logger = new Logger(MacroRegimeService.name);
  private readonly model: StructuredChatModel;

  constructor() {
    this.model = new BaseChatOpenAI({
      modelName: "gpt-5.1",
      temperature: 0,
    }) as unknown as StructuredChatModel;
  }

  async analyze(marketData: string): Promise<MacroRegime> {
    this.logger.log("Starting Macro Regime analysis...");

    const prompt = `
      Analyze the current macroeconomic regime based on the following market data.
      Identify key factors, determine if it's a bull, bear, or neutral market, and provide reasoning.

      Market Data:
      ${marketData}
    `;

    let retries = 3;
    while (retries > 0) {
      try {
        const analyzer = this.model.withStructuredOutput(MacroRegimeSchema);
        const result = await analyzer.invoke(prompt);

        this.logger.log("Macro Regime analysis completed successfully.");
        return result;
      } catch (error) {
        retries--;
        this.logger.warn(`Failed to perform Macro Regime analysis, retries left: ${retries}`, error);
        if (retries === 0) {
          this.logger.error("Exhausted retries for Macro Regime analysis");
          throw error;
        }
        await new Promise((res) => setTimeout(res, 2000));
      }
    }
    throw new Error("Macro Regime analysis failed");
  }
}
