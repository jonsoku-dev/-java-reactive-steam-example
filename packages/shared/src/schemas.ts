import { z } from "zod";

export const MacroRegimeSchema = z.object({
  regime: z
    .enum(["bull", "bear", "neutral"])
    .describe("The current market regime."),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence score of the analysis (0-100)."),
  factors: z
    .array(z.string())
    .describe("List of key macroeconomic factors influencing the regime."),
  reasoning: z
    .string()
    .describe("Detailed reasoning for the regime classification."),
});

export type MacroRegime = z.infer<typeof MacroRegimeSchema>;

export const PortfolioSchema = z.object({
  assets: z
    .array(
      z.object({
        symbol: z.string(),
        amount: z.number(),
        value: z.number().optional(),
      }),
    )
    .describe("List of assets in the portfolio."),
  total_value: z.number().optional(),
});

export type Portfolio = z.infer<typeof PortfolioSchema>;

export const RedTeamSchema = z.object({
  scenarios: z
    .array(
      z.object({
        name: z.string().describe("Name of the stress scenario."),
        description: z.string().describe("Description of the scenario."),
        impact_score: z
          .number()
          .min(0)
          .max(10)
          .describe("Potential impact score (0-10)."),
      }),
    )
    .describe("List of potential stress scenarios tested."),
  overall_risk_score: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall risk score of the portfolio (0-100)."),
  vulnerabilities: z
    .array(z.string())
    .describe("List of identified vulnerabilities in the strategy."),
  recommendations: z
    .array(z.string())
    .describe("Recommendations to mitigate risks."),
});

export type RedTeam = z.infer<typeof RedTeamSchema>;
