import { END, StateGraph } from "@langchain/langgraph";
import {
  analysisResults,
  type MacroRegime,
  type Portfolio,
  type RedTeam,
} from "@my-org/shared";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { DRIZZLE } from "../../infrastructure/database/database.module";
import type { MacroRegimeService } from "./macro-regime.service";
import type { PortfolioService } from "./portfolio.service";
import type { RedTeamService } from "./red-team.service";

// Define the state of our graph
export interface AgentState {
  marketData: string;
  macro?: MacroRegime;
  portfolio?: Portfolio;
  redTeam?: RedTeam;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private graph: any;

  constructor(
    private readonly macroService: MacroRegimeService,
    private readonly portfolioService: PortfolioService,
    private readonly redTeamService: RedTeamService,
    @Inject(DRIZZLE) private readonly db: MySql2Database<Record<string, never>>,
  ) {
    this.graph = this.initializeGraph();
  }

  private initializeGraph() {
    const workflow = new StateGraph<AgentState>({
      channels: {
        marketData: { value: null, default: () => "" },
        macro: {
          value: null,
          default: () => undefined,
        },
        portfolio: {
          value: null,
          default: () => undefined,
        },
        redTeam: {
          value: null,
          default: () => undefined,
        },
      },
    } as any);

    // Node 1: Analyze Macro Regime
    workflow.addNode("macro_analysis", async (state: AgentState) => {
      this.logger.log("Executing Macro Analysis Node");
      const result = await this.macroService.analyze(state.marketData);
      return { macro: result };
    });

    // Node 2: Construct Portfolio using PortfolioService
    workflow.addNode("portfolio_construction", async (state: AgentState) => {
      this.logger.log("Executing Portfolio Construction Node");
      if (!state.macro) throw new Error("Macro Regime missing");
      const result = await this.portfolioService.constructPortfolio(
        state.macro,
      );
      return { portfolio: result };
    });

    // Node 3: Red Team Stress Test
    workflow.addNode("red_team", async (state: AgentState) => {
      this.logger.log("Executing Red Team Node");
      if (!state.portfolio) throw new Error("Portfolio missing");
      const result = await this.redTeamService.analyze(state.portfolio);
      return { redTeam: result };
    });

    // Edges
    workflow.setEntryPoint("macro_analysis");
    workflow.addEdge("macro_analysis", "portfolio_construction");
    workflow.addEdge("portfolio_construction", "red_team");
    workflow.addEdge("red_team", END);

    return workflow.compile();
  }

  async runAnalysis(marketData: string): Promise<AgentState> {
    this.logger.log("Starting Agent Workflow...");
    const result = await this.graph.invoke({ marketData });

    // Save to DB
    try {
      this.logger.log("Saving analysis result to database...");
      await this.db.insert(analysisResults).values({
        marketData: result.marketData,
        macroRegime: result.macro,
        portfolio: result.portfolio,
        redTeam: result.redTeam,
      });
      this.logger.log("Analysis result saved successfully.");
    } catch (error) {
      this.logger.error("Failed to save analysis result to database", error);
      // We might choose to throw or just log depending on strictness.
      // Usually logging is enough if it's purely for history, but we'll let it fail loudly if DB is critical.
    }

    return result;
  }
}
