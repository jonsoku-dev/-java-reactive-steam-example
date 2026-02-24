import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { MacroRegimeSchema, MacroRegime } from '@my-org/shared';

@Injectable()
export class MacroRegimeService {
  private readonly logger = new Logger(MacroRegimeService.name);
  private readonly model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      model: 'gpt-5.1',
      temperature: 0,
    });
  }

  async analyze(marketData: string): Promise<MacroRegime> {
    this.logger.log('Starting Macro Regime analysis...');

    const prompt = `
      Analyze the current macroeconomic regime based on the following market data.
      Identify key factors, determine if it's a bull, bear, or neutral market, and provide reasoning.

      Market Data:
      ${marketData}
    `;

    try {
      const analyzer = this.model.withStructuredOutput(MacroRegimeSchema);
      const result = await analyzer.invoke(prompt);

      this.logger.log('Macro Regime analysis completed successfully.');
      return result;
    } catch (error) {
      this.logger.error('Failed to perform Macro Regime analysis', error);
      throw error;
    }
  }
}
