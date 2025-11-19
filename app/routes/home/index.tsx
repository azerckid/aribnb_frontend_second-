import { useNavigation } from "react-router";

import type { Route } from "./+types/index";

import { Grid } from "@chakra-ui/react";
import { getRooms } from "~/utils/api";
import Room from "~/components/rooms/Room";
import RoomSkeleton from "~/components/rooms/RoomSkeleton";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Home | Guest House Booking" },
    { name: "description", content: "Home page" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    // 쿠키를 전달하여 인증 정보 포함
    const cookie = request.headers.get("Cookie");
    const rooms = await getRooms(cookie || undefined);
    return { rooms };
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return { rooms: [] };
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { rooms } = loaderData;
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <Grid
      mt={10}
      mb={24}
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
      {isLoading ? (
        <>
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
          <RoomSkeleton />
        </>
      ) : null}
      {rooms.map((room) => (
        <Room key={room.id || room.pk} {...room} />
      ))}
    </Grid>
  );
}
