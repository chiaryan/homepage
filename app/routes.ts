import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("mc", "routes/server/page.tsx") ] satisfies RouteConfig;
