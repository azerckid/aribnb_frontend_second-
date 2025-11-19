import type { Route } from "./+types/index";
import { Stack, Text } from "@chakra-ui/react";
import { requireAuth } from "~/utils/auth";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Users | Guest House Booking" },
    { name: "description", content: "Users page" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
    // 인증이 필요한 페이지 예시
    const user = await requireAuth(request);
    return { user };
}

export default function Users({ loaderData }: Route.ComponentProps) {
    const { user } = loaderData;
    
    return (
        <Stack p={4}>
            <Text>Users</Text>
            <Text>안녕하세요, {user.name}님!</Text>
        </Stack>
    );
}


