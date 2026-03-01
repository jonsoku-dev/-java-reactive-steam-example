import { ChatOpenAI as BaseChatOpenAI } from "@langchain/openai";
import { type Portfolio, type RedTeam, RedTeamSchema } from "@my-org/shared";
import { Injectable, Logger } from "@nestjs/common";

interface StructuredChatModel {
  withStructuredOutput(schema: typeof RedTeamSchema): {
    invoke(prompt: string): Promise<RedTeam>;
  };
}

@Injectable()
export class RedTeamService {
  private readonly logger = new Logger(RedTeamService.name);
  private readonly model: StructuredChatModel;

  constructor() {
    this.model = new BaseChatOpenAI({
      modelName: "gpt-5.2",
      temperature: 0,
    }) as unknown as StructuredChatModel;
  }

  async analyze(portfolio: Portfolio): Promise<RedTeam> {
    this.logger.log("Starting Red Team stress test analysis...");

    const prompt = `
      Perform a Red Team stress test on the following investment portfolio.
      Identify vulnerabilities, simulate extreme market scenarios, and provide risk mitigation strategies.

      Portfolio Data:
      ${JSON.stringify(portfolio, null, 2)}
    `;

    let retries = 3;
    while (retries > 0) {
      try {
        const analyzer = this.model.withStructuredOutput(RedTeamSchema);
        const result = await analyzer.invoke(prompt);

        this.logger.log("Red Team analysis completed successfully.");
        return result;
      } catch (error) {
        retries--;
        this.logger.warn(`Failed to perform Red Team analysis, retries left: ${retries}`, error);
        if (retries === 0) {
          this.logger.error("Exhausted retries for Red Team analysis");
          throw error;
        }
        await new Promise((res) => setTimeout(res, 2000));
      }
    }
    throw new Error("Red Team analysis failed");
  }
}
