import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { RedTeamSchema, RedTeam, Portfolio } from '@my-org/shared';

@Injectable()
export class RedTeamService {
  private readonly logger = new Logger(RedTeamService.name);
  private readonly model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      model: 'gpt-5.2',
      temperature: 0,
    });
  }

  async analyze(portfolio: Portfolio): Promise<RedTeam> {
    this.logger.log('Starting Red Team stress test analysis...');

    // portfolio is now typed, so JSON.stringify is safe and correct
    const prompt = `
      Perform a Red Team stress test on the following investment portfolio.
      Identify vulnerabilities, simulate extreme market scenarios, and provide risk mitigation strategies.

      Portfolio Data:
      ${JSON.stringify(portfolio, null, 2)}
    `;

    try {
      const analyzer = this.model.withStructuredOutput(RedTeamSchema);
      const result = await analyzer.invoke(prompt);

      this.logger.log('Red Team analysis completed successfully.');
      return result;
    } catch (error) {
      this.logger.error('Failed to perform Red Team analysis', error);
      throw error;
    }
  }
}
