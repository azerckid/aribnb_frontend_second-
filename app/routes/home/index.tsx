import type { Route } from "./+types/index";
import { Stack, Text } from "@chakra-ui/react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Home | Guest House Booking" },
    { name: "description", content: "Home page" },
  ];
}

export default function Home() {
  return (
    <Stack p={4}>
      <Text>Home</Text>
    </Stack>
  );
}
