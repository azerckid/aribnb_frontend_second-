import type { Route } from "./+types/index";
import { Grid } from "@chakra-ui/react";
import Room from "../../components/rooms/Room";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Home | Guest House Booking" },
    { name: "description", content: "Home page" },
  ];
}

export default function Home() {
  return (
    <Grid
      mt={10}
      px={{ base: 0, lg: 0 }}
      columnGap={4}
      rowGap={8}
      templateColumns={{
        sm: "1fr",
        md: "1fr 1fr",
        lg: "repeat(3, 1fr)",
        xl: "repeat(4, 1fr)",
        "2xl": "repeat(5, 1fr)",
      }}
    >
      {[...Array(12)].map((_, index) => (
        <Room key={index} />
      ))}
    </Grid>
  );
}
