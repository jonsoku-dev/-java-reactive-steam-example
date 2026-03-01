import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { PortfolioSchema, Portfolio, MacroRegime } from '@my-org/shared';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);
  private readonly model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      model: 'gpt-5.1',
      temperature: 0,
    });
  }

  async constructPortfolio(regime: MacroRegime): Promise<Portfolio> {
    this.logger.log('Starting AI Portfolio Construction...');

    const prompt = `
      Construct an optimal investment portfolio based on the following macroeconomic regime analysis.
      Allocate percentages to relevant assets (e.g., SPY, QQQ, BND, GLD) that perform best under these conditions.
      Total value should be assumed as 100000 for relative calculation if needed.

      Macro Regime Data:
      ${JSON.stringify(regime, null, 2)}
    `;

    try {
      const analyzer = this.model.withStructuredOutput(PortfolioSchema);
      const result = await analyzer.invoke(prompt);

      this.logger.log('Portfolio Construction completed successfully.');
      return result;
    } catch (error) {
      this.logger.error('Failed to construct portfolio', error);
      throw error;
    }
  }
}
