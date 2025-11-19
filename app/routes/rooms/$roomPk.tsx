import type { Route } from "./+types/$roomPk";
import { getRoom, getRoomReviews } from "~/utils/api";
import { Box, Container, Grid, HStack, Heading, Image, Skeleton, Text, VStack } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { useNavigation } from "react-router";
import { FaStar } from "react-icons/fa";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Room Detail | Guest House Booking" },
        { name: "description", content: "Room detail page" },
    ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
    try {
        const cookie = request.headers.get("Cookie");
        const [room, reviews] = await Promise.all([
            getRoom(params.roomPk, cookie || undefined),
            getRoomReviews(params.roomPk).catch(() => []), // 리뷰가 없어도 에러가 나지 않도록
        ]);
        return { room, reviews };
    } catch (error) {
        console.error("Failed to fetch room:", error);
        throw new Response("Room not found", { status: 404 });
    }
}

export default function RoomDetail({ loaderData }: Route.ComponentProps) {
    const { room, reviews } = loaderData;
    const navigation = useNavigation();
    const isLoading = navigation.state === "loading";

    // 최대 5개의 사진만 표시 (첫 번째는 2x2, 나머지 4개는 1x1)
    const displayPhotos = room.photos.slice(0, 5);

    return (
        <Box
            mt={10}
            pb={40}
            px={{
                base: 0,
                lg: 0,
            }}
        >
            {isLoading ? (
                <Skeleton height="43px" width="25%" />
            ) : (
                <Heading>{room.name}</Heading>
            )}

            {displayPhotos.length > 0 && (
                displayPhotos.length > 4 ? (
                    <Grid
                        mt={8}
                        rounded="xl"
                        overflow="hidden"
                        gap={2}
                        height="60vh"
                        templateRows="1fr 1fr"
                        templateColumns="repeat(4, 1fr)"
                    >
                        {[0, 1, 2, 3, 4].map((index) => {
                            const photo = displayPhotos[index];
                            if (!photo || !photo.file) return null;

                            const isFirst = index === 0;
                            return (
                                <Box
                                    key={photo.pk}
                                    gridColumn={isFirst ? "span 2" : "span 1"}
                                    gridRow={isFirst ? "span 2" : "span 1"}
                                    overflow="hidden"
                                >
                                    {isLoading ? (
                                        <Skeleton h="100%" w="100%" />
                                    ) : (
                                        <Image
                                            objectFit="cover"
                                            w="100%"
                                            h="100%"
                                            src={photo.file || undefined}
                                            alt={photo.description || room.name}
                                            loading="lazy"
                                        />
                                    )}
                                </Box>
                            );
                        })}
                    </Grid>
                ) : (
                    <Grid
                        mt={8}
                        rounded="xl"
                        overflow="hidden"
                        gap={2}
                        templateColumns={`repeat(${Math.min(displayPhotos.length, 4)}, 1fr)`}
                    >
                        {displayPhotos.map((photo) => {
                            if (!photo || !photo.file) return null;
                            return (
                                <Box key={photo.pk} overflow="hidden">
                                    {isLoading ? (
                                        <Skeleton h="300px" w="100%" />
                                    ) : (
                                        <Image
                                            objectFit="cover"
                                            w="100%"
                                            h="300px"
                                            src={photo.file || undefined}
                                            alt={photo.description || room.name}
                                            loading="lazy"
                                        />
                                    )}
                                </Box>
                            );
                        })}
                    </Grid>
                )
            )}

            <HStack w="40%" justifyContent="space-between" mt={10}>
                <VStack alignItems="flex-start">
                    {isLoading ? (
                        <Skeleton height="30px" width="300px" />
                    ) : (
                        <Heading fontSize="2xl">
                            House hosted by {room.owner.name}
                        </Heading>
                    )}
                    {isLoading ? (
                        <Skeleton height="30px" width="200px" />
                    ) : (
                        <VStack alignItems="flex-start" gap={2} w="100%">
                            <HStack justifyContent="flex-start" w="100%">
                                <Text>
                                    {room.toilets} toilet{room.toilets === 1 ? "" : "s"}
                                </Text>
                                <Text>∙</Text>
                                <Text>
                                    {room.rooms} room{room.rooms === 1 ? "" : "s"}
                                </Text>
                                {room.beds !== undefined && (
                                    <>
                                        <Text>∙</Text>
                                        <Text>
                                            {room.beds} bed{room.beds === 1 ? "" : "s"}
                                        </Text>
                                    </>
                                )}
                            </HStack>
                            {room.category && (
                                <Box>
                                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                        Category: <Text as="span" fontWeight="bold">{room.category.name}</Text>
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    )}
                </VStack>
                {isLoading ? (
                    <Skeleton width="80px" height="80px" rounded="full" />
                ) : (
                    <Avatar.Root size="xl">
                        <Avatar.Image src={room.owner.avatar} alt={room.owner.name} />
                        <Avatar.Fallback name={room.owner.name} />
                    </Avatar.Root>
                )}
            </HStack>

            {room.amenities && room.amenities.length > 0 && (
                <Box mt={10}>
                    <Heading fontSize="2xl" mb={5}>
                        What this place offers
                    </Heading>
                    <Grid
                        templateColumns={{
                            base: "1fr",
                            md: "1fr 1fr",
                            lg: "1fr 1fr 1fr",
                        }}
                        gap={4}
                        mt={5}
                    >
                        {room.amenities.map((amenity) => (
                            <HStack key={amenity.pk} alignItems="flex-start" gap={3}>
                                <Box
                                    w="24px"
                                    h="24px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    flexShrink={0}
                                    mt={0.5}
                                >
                                    <Text fontSize="lg">✓</Text>
                                </Box>
                                <VStack alignItems="flex-start" gap={0} flex={1}>
                                    <Text fontWeight="medium" fontSize="md">
                                        {amenity.name}
                                    </Text>
                                    {amenity.description && (
                                        <Text fontSize="sm" color="gray.600">
                                            {amenity.description}
                                        </Text>
                                    )}
                                </VStack>
                            </HStack>
                        ))}
                    </Grid>
                </Box>
            )}

            {room.description && (
                <Box mt={10}>
                    <Heading fontSize="2xl" mb={5}>
                        About this place
                    </Heading>
                    <Text fontSize="md" color="gray.700" lineHeight="tall" whiteSpace="pre-line">
                        {room.description}
                    </Text>
                </Box>
            )}

            <Box mt={10}>
                <Heading fontSize="2xl" mb={5}>
                    <HStack>
                        <FaStar /> <Text>{room.rating}</Text>
                        <Text>∙</Text>
                        <Text>
                            {reviews.length} review{reviews.length === 1 ? "" : "s"}
                        </Text>
                    </HStack>
                </Heading>

                {reviews.length > 0 && (
                    <Container mt={16} maxW="container.lg" mx="0">
                        <Grid
                            templateColumns={{
                                base: "1fr",
                                md: "1fr 1fr",
                            }}
                            gap={10}
                        >
                            {reviews.map((review, index) => (
                                <VStack key={index} alignItems="flex-start" gap={3}>
                                    <HStack gap={3} alignItems="flex-start">
                                        <Avatar.Root size="md">
                                            <Avatar.Image src={review.user.avatar} alt={review.user.name || review.user.username} />
                                            <Avatar.Fallback name={review.user.name || review.user.username} />
                                        </Avatar.Root>
                                        <VStack alignItems="flex-start" gap={1} flex={1}>
                                            <Text fontWeight="bold" fontSize="md">
                                                {review.user.name || review.user.username}
                                            </Text>
                                            <HStack gap={1} alignItems="center">
                                                <FaStar size={12} />
                                                <Text fontSize="sm">{review.rating}</Text>
                                                {review.created_at && (
                                                    <>
                                                        <Text fontSize="sm" color="gray.500">∙</Text>
                                                        <Text fontSize="sm" color="gray.500">
                                                            {new Date(review.created_at).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </Text>
                                                    </>
                                                )}
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.600" lineHeight="tall">
                                        {review.payload}
                                    </Text>
                                </VStack>
                            ))}
                        </Grid>
                    </Container>
                )}
            </Box>
        </Box>
    );
}

