import type { Route } from "./+types/index";
import { Box, Grid, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";

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
      px={0}
      columnGap={4}
      rowGap={8}
      templateColumns={"repeat(5, 1fr)"}
    >
      <VStack alignItems={"flex-start"} gap={1}>
        <Box overflow={"hidden"} mb={3} rounded="3xl">
          <Image
            h="280"
            src="https://www.newconcept180.com/images/blog/deck-addition.png"
          />
        </Box>
        <Box>
          <Grid templateColumns={"6fr 1fr"}>
            <Text display={"block"} as="b" fontSize={"md"} color="gray.600" lineClamp={1}>
              Cheomdangwahak-ro,Jeongeup-si, North Jeolla Province, South Korea
            </Text>
            <HStack gap={1}>
              <FaStar size={15} />
              <Text fontSize={"sm"} color="gray.600">5.0</Text>
            </HStack>
          </Grid>
          <Text fontSize={"sm"} color="gray.600">
            Seoul, S. Korea
          </Text>
          <Text fontSize={"sm"} color="gray.600">
            <Text as="b">$72</Text> / night
          </Text>
        </Box>
      </VStack>
    </Grid>
  );
}
