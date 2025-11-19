import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("routes/_app.tsx", [
        index("routes/home/index.tsx"),
        route("users", "routes/users/index.tsx"),
        route("rooms/upload", "routes/rooms/upload.tsx"),
        route("rooms/:roomPk", "routes/rooms/$roomPk.tsx"),
        route("rooms/:roomPk/photos", "routes/rooms/$roomPk.photos.tsx"),
        route("auth/github/callback", "routes/auth/github/callback.tsx"),
        route("auth/kakao/callback", "routes/auth/kakao/callback.tsx"),
    ]),
] satisfies RouteConfig;
