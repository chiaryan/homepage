import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("mc", "routes/server.tsx") ] satisfies RouteConfig;
