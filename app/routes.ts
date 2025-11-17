import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("routes/_app.tsx", [
        index("routes/home/index.tsx"),
        route("users", "routes/users/index.tsx"),
        route("rooms/:roomPk", "routes/rooms/$roomPk.tsx"),
    ]),
] satisfies RouteConfig;
