import type { Route } from "./+types/users";
import { Text, Stack } from "@chakra-ui/react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Users | Airbnb Clone" },
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


