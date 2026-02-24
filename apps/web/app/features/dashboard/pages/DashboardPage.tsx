export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Auto-Trading Analyst Dashboard</h1>
      <p className="text-gray-600">
        AI-powered market analysis and portfolio stress testing.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Market Regime</h2>
          <div className="h-32 bg-gray-50 flex items-center justify-center rounded">
            <span className="text-gray-400">Loading AI Analysis...</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Red Team Status</h2>
          <div className="h-32 bg-gray-50 flex items-center justify-center rounded">
            <span className="text-gray-400">Loading Stress Tests...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
