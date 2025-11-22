import { Avatar, Box, Container, Grid, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
import type { IReview } from "~/types";

interface RoomReviewsProps {
    reviews: IReview[];
    rating: number;
}

export function RoomReviews({ reviews, rating }: RoomReviewsProps) {
    return (
        <Box mt={{ base: 6, md: 10 }}>
            <Heading fontSize={{ base: "xl", md: "2xl" }} mb={5}>
                <HStack gap={2} flexWrap="wrap">
                    <FaStar /> <Text>{rating}</Text>
                    <Text>∙</Text>
                    <Text>
                        {reviews.length} review{reviews.length === 1 ? "" : "s"}
                    </Text>
                </HStack>
            </Heading>

            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={{ base: 6, md: 10 }}
                mt={{ base: 8, md: 16 }}
            >
                {reviews.length > 0 && (
                    <Box>
                        <Container maxW="container.lg" mx="0" px={{ base: 0, md: 4 }}>
                            <Grid
                                templateColumns="1fr"
                                gap={{ base: 6, md: 10 }}
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
                    </Box>
                )}
            </Grid>
        </Box>
    );
}

