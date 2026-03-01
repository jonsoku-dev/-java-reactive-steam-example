import { ChatOpenAI as BaseChatOpenAI } from "@langchain/openai";
import { type Portfolio, PortfolioSchema, type MacroRegime } from "@my-org/shared";
import { Injectable, Logger } from "@nestjs/common";

interface StructuredChatModel {
  withStructuredOutput(schema: typeof PortfolioSchema): {
    invoke(prompt: string): Promise<Portfolio>;
  };
}

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);
  private readonly model: StructuredChatModel;

  constructor() {
    this.model = new BaseChatOpenAI({
      modelName: "gpt-5.1",
      temperature: 0,
    }) as unknown as StructuredChatModel;
  }

  async constructPortfolio(regime: MacroRegime): Promise<Portfolio> {
    this.logger.log("Starting AI Portfolio Construction...");

    const prompt = `
      Construct an optimal investment portfolio based on the following macroeconomic regime analysis.
      Allocate percentages to relevant assets (e.g., SPY, QQQ, BND, GLD) that perform best under these conditions.
      Total value should be assumed as 100000 for relative calculation if needed.

      Macro Regime Data:
      ${JSON.stringify(regime, null, 2)}
    `;

    let retries = 3;
    while (retries > 0) {
      try {
        const analyzer = this.model.withStructuredOutput(PortfolioSchema);
        const result = await analyzer.invoke(prompt);

        this.logger.log("Portfolio Construction completed successfully.");
        return result;
      } catch (error) {
        retries--;
        this.logger.warn(`Failed to construct portfolio, retries left: ${retries}`, error);
        if (retries === 0) {
          this.logger.error("Exhausted retries for portfolio construction");
          throw error;
        }
        await new Promise((res) => setTimeout(res, 2000));
      }
    }
    throw new Error("Portfolio construction failed");
  }
}
