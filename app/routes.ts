import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("routes/_app.tsx", [
        index("routes/home.tsx"),
        route("users", "routes/users.tsx"),
    ]),
] satisfies RouteConfig;
