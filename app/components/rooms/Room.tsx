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

export default function Room() {
  const gray = "gray.600";
  return (
    <VStack alignItems={"flex-start"} gap={2}>
      <Box position="relative" overflow={"hidden"} mb={3} rounded="2xl">
        <Image
          minH="280"
          objectFit="cover"
          src="https://media.vrbo.com/lodging/19000000/18770000/18763800/18763707/3036324a.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill"
          alt="Room preview"
          loading="lazy"
        />
        <Button
          aria-label="Add to wishlist"
          variant={"ghost"}
          position="absolute"
          top={0}
          right={0}
          color="white"
        >
          <FaRegHeart size="20px" />
        </Button>
      </Box>
      <Box>
        <Grid gap={2} templateColumns={"6fr 1fr"}>
          <Text display={"block"} as="b" lineClamp={1} fontSize="md" color={gray}>
            Cheomdangwahak-ro,Jeongeup-si, North Jeolla Province, South Korea
          </Text>
          <HStack gap={1} alignItems="center">
            <FaStar size={15} />
            <Text fontSize={"sm"} color={gray}>
              5.0
            </Text>
          </HStack>
        </Grid>
        <Text fontSize={"sm"} color={gray}>
          Seoul, S. Korea
        </Text>
        <Text fontSize={"sm"} color={gray}>
          <Text as="b">$72</Text> / night
        </Text>
      </Box>
    </VStack>
  );
}


