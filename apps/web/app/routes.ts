import { index, type RouteConfig } from "@react-router/dev/routes";
import { dashboardRoutes } from "./features/dashboard/routes";

export default [
  index("features/dashboard/pages/DashboardPage.tsx", { id: "root-index" }),
  ...dashboardRoutes,
] satisfies RouteConfig;
