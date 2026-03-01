import { Injectable, Logger } from '@nestjs/common';
import { StateGraph, END, CompiledStateGraph } from '@langchain/langgraph';
import { MacroRegimeService } from './macro-regime.service';
import { PortfolioService } from './portfolio.service';
import { RedTeamService } from './red-team.service';
import { MacroRegime, RedTeam, Portfolio } from '@my-org/shared';

// Define the state of our graph
interface AgentState {
  marketData: string;
  macro?: MacroRegime;
  portfolio?: Portfolio;
  redTeam?: RedTeam;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private graph: CompiledStateGraph<AgentState, Partial<AgentState>, "__start__">;

  constructor(
    private readonly macroService: MacroRegimeService,
    private readonly portfolioService: PortfolioService,
    private readonly redTeamService: RedTeamService,
  ) {
    this.graph = this.initializeGraph();
  }

  private initializeGraph(): CompiledStateGraph<AgentState, Partial<AgentState>, "__start__"> {
    const workflow = new StateGraph<AgentState>({
      channels: {
        marketData: { value: (x: string, y: string) => y, default: () => "" },
        macro: { value: (x: MacroRegime, y: MacroRegime) => y, default: () => undefined },
        portfolio: { value: (x: Portfolio, y: Portfolio) => y, default: () => undefined },
        redTeam: { value: (x: RedTeam, y: RedTeam) => y, default: () => undefined },
      }
    });

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
      const result = await this.portfolioService.constructPortfolio(state.macro);
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
    return result;
  }
}
