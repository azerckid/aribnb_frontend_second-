import type { Route } from "./+types/index";
import { Grid } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import Room from "../../components/rooms/Room";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Home | Guest House Booking" },
    { name: "description", content: "Home page" },
  ];
}

export default function Home() {
  const [itemCount, setItemCount] = useState(12);

  const handleLoadMore = useCallback(() => {
    setItemCount((prev) => prev + 12);
  }, []);

  const { setSentinel } = useInfiniteScroll(handleLoadMore);

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
      {[...Array(itemCount)].map((_, index) => (
        <Room key={index} />
      ))}
      <div ref={setSentinel} />
    </Grid>
  );
}
