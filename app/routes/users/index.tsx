import type { Route } from "./+types/index";
import { Stack, Text } from "@chakra-ui/react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Users | Guest House Booking" },
    { name: "description", content: "Users page" },
  ];
}

export default function Users() {
  return (
    <Stack p={4}>
      <Text>Users</Text>
    </Stack>
  );
}


