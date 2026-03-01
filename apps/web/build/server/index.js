import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useEffect } from "react";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
const API_BASE_URL = "http://localhost:3000";
async function runAgentAnalysis(marketData) {
  const response = await fetch(`${API_BASE_URL}/ai/agent/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ marketData })
  });
  if (!response.ok) throw new Error("Failed to run agent analysis");
  return response.json();
}
async function fetchHistory() {
  const response = await fetch(`${API_BASE_URL}/ai/history`);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
}
const DashboardPage = UNSAFE_withComponentProps(function DashboardPage2() {
  var _a;
  const [marketData, setMarketData] = useState("Recent job reports show strong growth...");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
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
      loadHistory();
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex-1",
      children: [/* @__PURE__ */ jsxs("header", {
        className: "mb-8",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-3xl font-bold mb-2",
          children: "Auto-Trading Analyst Dashboard"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-gray-600",
          children: "AI-powered market analysis and portfolio stress testing."
        })]
      }), /* @__PURE__ */ jsxs("section", {
        className: "mb-8 bg-white p-6 rounded-lg shadow border border-gray-200",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-xl font-semibold mb-4",
          children: "Input Market Data"
        }), /* @__PURE__ */ jsx("textarea", {
          className: "w-full p-3 border rounded mb-4 h-32",
          value: marketData,
          onChange: (e) => setMarketData(e.target.value),
          placeholder: "Enter market news or data here..."
        }), /* @__PURE__ */ jsx("button", {
          onClick: handleAnalysis,
          disabled: loading,
          className: "bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50",
          children: loading ? "Running AI Agents..." : "Run Analysis Agent"
        })]
      }), result && /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-1 xl:grid-cols-2 gap-6",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "bg-white p-6 rounded-lg shadow border border-gray-200",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-xl font-semibold mb-2 text-blue-800",
            children: "Market Regime"
          }), result.macro ? /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("div", {
              className: "text-4xl font-bold mb-2 capitalize",
              children: result.macro.regime
            }), /* @__PURE__ */ jsxs("div", {
              className: "text-sm text-gray-500 mb-4",
              children: ["Confidence: ", result.macro.confidence, "%"]
            }), /* @__PURE__ */ jsx("h3", {
              className: "font-medium mb-1",
              children: "Key Factors:"
            }), /* @__PURE__ */ jsx("ul", {
              className: "list-disc list-inside text-sm text-gray-700 mb-4",
              children: result.macro.factors.map((f, i) => /* @__PURE__ */ jsx("li", {
                children: f
              }, i))
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-sm italic text-gray-600",
              children: ['"', result.macro.reasoning, '"']
            })]
          }) : /* @__PURE__ */ jsx("span", {
            className: "text-gray-400",
            children: "No data"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "bg-white p-6 rounded-lg shadow border border-gray-200",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-xl font-semibold mb-2 text-green-800",
            children: "Generated Portfolio"
          }), result.portfolio ? /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsxs("div", {
              className: "text-2xl font-bold mb-4",
              children: ["$", (_a = result.portfolio.total_value) == null ? void 0 : _a.toLocaleString()]
            }), /* @__PURE__ */ jsx("h3", {
              className: "font-medium mb-1",
              children: "Allocation:"
            }), /* @__PURE__ */ jsx("ul", {
              className: "space-y-2",
              children: result.portfolio.assets.map((asset, i) => /* @__PURE__ */ jsxs("li", {
                className: "flex justify-between border-b pb-1",
                children: [/* @__PURE__ */ jsx("span", {
                  children: asset.symbol
                }), /* @__PURE__ */ jsxs("span", {
                  className: "font-mono",
                  children: [asset.amount, "%"]
                })]
              }, i))
            })]
          }) : /* @__PURE__ */ jsx("span", {
            className: "text-gray-400",
            children: "No data"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "bg-white p-6 rounded-lg shadow border border-gray-200 col-span-1 xl:col-span-2",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-xl font-semibold mb-2 text-red-800",
            children: "Red Team Stress Test"
          }), result.redTeam ? /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center justify-between mb-4",
              children: [/* @__PURE__ */ jsx("span", {
                className: "font-medium",
                children: "Risk Score:"
              }), /* @__PURE__ */ jsxs("span", {
                className: `text-2xl font-bold ${result.redTeam.overall_risk_score > 50 ? "text-red-600" : "text-green-600"}`,
                children: [result.redTeam.overall_risk_score, "/100"]
              })]
            }), /* @__PURE__ */ jsx("h3", {
              className: "font-medium mb-1",
              children: "Scenarios:"
            }), /* @__PURE__ */ jsx("ul", {
              className: "list-disc list-inside text-sm text-gray-700 mb-4",
              children: result.redTeam.scenarios.map((s, i) => /* @__PURE__ */ jsxs("li", {
                children: [s.name, " (Impact: ", s.impact_score, "/10)"]
              }, i))
            }), /* @__PURE__ */ jsx("h3", {
              className: "font-medium mb-1",
              children: "Recommendations:"
            }), /* @__PURE__ */ jsx("ul", {
              className: "list-disc list-inside text-sm text-gray-700",
              children: result.redTeam.recommendations.map((r, i) => /* @__PURE__ */ jsx("li", {
                children: r
              }, i))
            })]
          }) : /* @__PURE__ */ jsx("span", {
            className: "text-gray-400",
            children: "No data"
          })]
        })]
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "w-full lg:w-80 bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit max-h-screen overflow-y-auto",
      children: [/* @__PURE__ */ jsx("h2", {
        className: "text-xl font-semibold mb-4",
        children: "Analysis History"
      }), history.length === 0 ? /* @__PURE__ */ jsx("p", {
        className: "text-gray-500 text-sm",
        children: "No history available."
      }) : /* @__PURE__ */ jsx("ul", {
        className: "space-y-4",
        children: history.map((item) => {
          const macro = typeof item.macroRegime === "string" ? JSON.parse(item.macroRegime) : item.macroRegime;
          return /* @__PURE__ */ jsxs("li", {
            className: "bg-white p-4 rounded shadow-sm border border-gray-100 text-sm",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex justify-between items-center mb-2",
              children: [/* @__PURE__ */ jsxs("span", {
                className: "font-bold text-gray-700",
                children: ["#", item.id]
              }), /* @__PURE__ */ jsx("span", {
                className: "text-xs text-gray-400",
                children: new Date(item.createdAt).toLocaleString()
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "mb-1",
              children: [/* @__PURE__ */ jsx("span", {
                className: "font-medium",
                children: "Regime:"
              }), " ", /* @__PURE__ */ jsx("span", {
                className: "capitalize",
                children: (macro == null ? void 0 : macro.regime) || "N/A"
              })]
            }), /* @__PURE__ */ jsx("button", {
              className: "text-blue-600 hover:underline text-xs mt-2",
              onClick: () => {
                setResult({
                  macro: typeof item.macroRegime === "string" ? JSON.parse(item.macroRegime) : item.macroRegime,
                  portfolio: typeof item.portfolio === "string" ? JSON.parse(item.portfolio) : item.portfolio,
                  redTeam: typeof item.redTeam === "string" ? JSON.parse(item.redTeam) : item.redTeam
                });
                setMarketData(item.marketData || "");
              },
              children: "View Details"
            })]
          }, item.id);
        })
      })]
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: DashboardPage
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-lUD5IwR8.js", "imports": ["/assets/chunk-LFPYN7LY-dc6hU9Pt.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": true, "module": "/assets/root-O8gL97FC.js", "imports": ["/assets/chunk-LFPYN7LY-dc6hU9Pt.js"], "css": ["/assets/root-Sw1_N2yj.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "root-index": { "id": "root-index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/DashboardPage-BG0D53Cy.js", "imports": ["/assets/chunk-LFPYN7LY-dc6hU9Pt.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "features/dashboard/pages/DashboardPage": { "id": "features/dashboard/pages/DashboardPage", "parentId": "root", "path": "dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/DashboardPage-BG0D53Cy.js", "imports": ["/assets/chunk-LFPYN7LY-dc6hU9Pt.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-df35cef1.js", "version": "df35cef1", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "root-index": {
    id: "root-index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route2
  },
  "features/dashboard/pages/DashboardPage": {
    id: "features/dashboard/pages/DashboardPage",
    parentId: "root",
    path: "dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
