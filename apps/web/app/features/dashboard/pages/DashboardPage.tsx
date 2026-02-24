import { useState } from "react";
import { runAgentAnalysis } from "../../../shared/api";
import type { MacroRegime, RedTeam, Portfolio } from "@my-org/shared";

export default function DashboardPage() {
  const [marketData, setMarketData] = useState("Recent job reports show strong growth...");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    macro?: MacroRegime;
    portfolio?: Portfolio;
    redTeam?: RedTeam;
  } | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const data = await runAgentAnalysis(marketData);
      setResult(data);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Auto-Trading Analyst Dashboard</h1>
        <p className="text-gray-600">
          AI-powered market analysis and portfolio stress testing.
        </p>
      </header>

      <section className="mb-8 bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Input Market Data</h2>
        <textarea
          className="w-full p-3 border rounded mb-4 h-32"
          value={marketData}
          onChange={(e) => setMarketData(e.target.value)}
          placeholder="Enter market news or data here..."
        />
        <button
          onClick={handleAnalysis}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Running AI Agents..." : "Run Analysis Agent"}
        </button>
      </section>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Macro Regime Card */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-blue-800">Market Regime</h2>
            {result.macro ? (
              <div>
                <div className="text-4xl font-bold mb-2 capitalize">{result.macro.regime}</div>
                <div className="text-sm text-gray-500 mb-4">Confidence: {result.macro.confidence}%</div>
                <h3 className="font-medium mb-1">Key Factors:</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 mb-4">
                  {result.macro.factors.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
                <p className="text-sm italic text-gray-600">"{result.macro.reasoning}"</p>
              </div>
            ) : (
              <span className="text-gray-400">No data</span>
            )}
          </div>

          {/* Portfolio Card */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-green-800">Generated Portfolio</h2>
             {result.portfolio ? (
              <div>
                <div className="text-2xl font-bold mb-4">${result.portfolio.total_value?.toLocaleString()}</div>
                <h3 className="font-medium mb-1">Allocation:</h3>
                <ul className="space-y-2">
                  {result.portfolio.assets.map((asset, i) => (
                    <li key={i} className="flex justify-between border-b pb-1">
                      <span>{asset.symbol}</span>
                      <span className="font-mono">{asset.amount}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <span className="text-gray-400">No data</span>
            )}
          </div>

          {/* Red Team Card */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-red-800">Red Team Stress Test</h2>
             {result.redTeam ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Risk Score:</span>
                  <span className={`text-2xl font-bold ${result.redTeam.overall_risk_score > 50 ? 'text-red-600' : 'text-green-600'}`}>
                    {result.redTeam.overall_risk_score}/100
                  </span>
                </div>
                <h3 className="font-medium mb-1">Scenarios:</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 mb-4">
                  {result.redTeam.scenarios.map((s, i) => (
                    <li key={i}>{s.name} (Impact: {s.impact_score}/10)</li>
                  ))}
                </ul>
                <h3 className="font-medium mb-1">Recommendations:</h3>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {result.redTeam.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            ) : (
              <span className="text-gray-400">No data</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
