import { useState, useEffect } from "react";
import { runAgentAnalysis, fetchHistory } from "../../../shared/api";
import type { MacroRegime, RedTeam, Portfolio, AnalysisResult } from "@my-org/shared";

export default function DashboardPage() {
  const [marketData, setMarketData] = useState("Recent job reports show strong growth...");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [result, setResult] = useState<{
    macro?: MacroRegime;
    portfolio?: Portfolio;
    redTeam?: RedTeam;
  } | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const data = await runAgentAnalysis(marketData);
      setResult(data);
      loadHistory(); // Refresh history after new analysis
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 col-span-1 xl:col-span-2">
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

      {/* History Sidebar */}
      <div className="w-full lg:w-80 bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit max-h-screen overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Analysis History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">No history available.</p>
        ) : (
          <ul className="space-y-4">
            {history.map((item) => {
               // Due to DB storing JSON, we might need to parse if not automatically parsed by ORM
               const macro = typeof item.macroRegime === 'string' ? JSON.parse(item.macroRegime) : item.macroRegime;

               return (
                <li key={item.id} className="bg-white p-4 rounded shadow-sm border border-gray-100 text-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700">#{item.id}</span>
                    <span className="text-xs text-gray-400">{new Date(item.createdAt!).toLocaleString()}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Regime:</span> <span className="capitalize">{macro?.regime || 'N/A'}</span>
                  </div>
                  <button
                    className="text-blue-600 hover:underline text-xs mt-2"
                    onClick={() => {
                      setResult({
                        macro: typeof item.macroRegime === 'string' ? JSON.parse(item.macroRegime) : item.macroRegime,
                        portfolio: typeof item.portfolio === 'string' ? JSON.parse(item.portfolio) : item.portfolio,
                        redTeam: typeof item.redTeam === 'string' ? JSON.parse(item.redTeam) : item.redTeam,
                      });
                      setMarketData(item.marketData || "");
                    }}
                  >
                    View Details
                  </button>
                </li>
               );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
