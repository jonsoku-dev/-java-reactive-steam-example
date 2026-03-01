import type { MacroRegime, RedTeam, Portfolio, AnalysisResult } from "@my-org/shared";

const API_BASE_URL = "http://localhost:3000";

export async function fetchMacroRegime(url: string): Promise<MacroRegime> {
  const response = await fetch(`${API_BASE_URL}/ai/macro-regime`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) throw new Error("Failed to fetch macro regime");
  return response.json();
}

export async function fetchRedTeamAnalysis(portfolio: Portfolio): Promise<RedTeam> {
  const response = await fetch(`${API_BASE_URL}/ai/red-team`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(portfolio),
  });
  if (!response.ok) throw new Error("Failed to fetch red team analysis");
  return response.json();
}

export async function runAgentAnalysis(marketData: string) {
  const response = await fetch(`${API_BASE_URL}/ai/agent/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ marketData }),
  });
  if (!response.ok) throw new Error("Failed to run agent analysis");
  return response.json();
}

export async function fetchHistory(): Promise<AnalysisResult[]> {
  const response = await fetch(`${API_BASE_URL}/ai/history`);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
}
