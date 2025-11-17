import { Link } from "react-router";

import type { IRoom } from "~/types";

import { FaRegHeart, FaStar } from "react-icons/fa";
import {
  Box,
  Button,
  Grid,
  HStack,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";

export default function Room(room: IRoom) {
  const { id, name, rating, city, country, price, photos } = room;
  const imageUrl = photos[0]?.file || "";
  const roomId = id || room.pk || 0;

  return (
    <Link to={`/rooms/${roomId}`}>
      <VStack alignItems={"flex-start"} gap={2}>
        <Box position="relative" overflow={"hidden"} mb={3} rounded="2xl">
          <Image
            minH="280"
            objectFit="cover"
            src={imageUrl}
            alt={name}
            loading="lazy"
          />
          <Button
            aria-label="Add to wishlist"
            variant={"ghost"}
            position="absolute"
            top={0}
            right={0}
            color="white"
            _hover={{ bg: "transparent" }}
          >
            <FaRegHeart size="20px" />
          </Button>
        </Box>
        <Box>
          <Grid gap={2} templateColumns={"6fr 1fr"}>
            <Text display={"block"} as="b" lineClamp={1} fontSize="md" color={"gray.600"}>
              {name}
            </Text>
            <HStack gap={1} alignItems="center" color={"gray.600"} _hover={{ color: "red.500" }}>
              <FaStar size={15} />
              <Text fontSize={"sm"}>
                {rating}
              </Text>
            </HStack>
          </Grid>
          <Text fontSize={"sm"} color={"gray.600"}>
            {city}, {country}
          </Text>
          <Text fontSize={"sm"} color={"gray.600"}>
            <Text as="b">${price}</Text> / night
          </Text>
        </Box>
      </VStack>
    </Link>
  );
}


