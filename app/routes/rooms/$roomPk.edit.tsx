import { Form, redirect, useActionData, useNavigation, useNavigate } from "react-router";

import type { Route } from "./+types/$roomPk.edit";

import {
    Box,
    Button,
    Container,
    Heading,
    Input,
    SimpleGrid,
    Textarea,
    VStack,
    Text,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { FaBed, FaDollarSign, FaToilet } from "react-icons/fa";
import type { ICategory } from "~/types";
import { toaster } from "~/components/ui/toaster";
import { getAmenities, getCategories, updateRoom, getRoom } from "~/utils/api";
import { parseApiError } from "~/utils/error";
import { uploadRoomSchema } from "~/utils/validation";
import { requireHost } from "~/utils/auth";

export async function clientLoader({ request, params }: Route.ClientLoaderArgs) {
    // 호스트 권한 체크 (로그인 체크 포함)
    // clientLoader에서는 브라우저가 자동으로 쿠키를 처리하므로 별도 전달 불필요
    const user = await requireHost(request);

    const roomPk = params.roomPk;

    if (!roomPk) {
        throw new Response("Room ID is required", { status: 400 });
    }

    // 방 정보, 편의시설, 카테고리 데이터를 병렬로 가져오기
    try {
        const [room, amenities, categories] = await Promise.all([
            getRoom(roomPk),
            getAmenities().catch((error) => {
                if (import.meta.env.DEV) {
                    console.error("Failed to fetch amenities:", error);
                }
                return [];
            }),
            getCategories().catch((error) => {
                if (import.meta.env.DEV) {
                    console.error("Failed to fetch categories:", error);
                }
                return [];
            }),
        ]);

        // 방 소유자 확인
        if (!room.is_owner) {
            throw new Response("You don't have permission to edit this room", { status: 403 });
        }

        return { user, room, amenities, categories };
    } catch (error) {
        if (error instanceof Response) {
            throw error;
        }
        if (import.meta.env.DEV) {
            console.error("Loader error:", error);
        }
        throw new Response("Failed to load room data", { status: 500 });
    }
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
    // 호스트 권한 체크
    const user = await requireHost(request);

    const roomPk = params.roomPk;
    if (!roomPk) {
        return { error: "Room ID is required" };
    }

    const formData = await request.formData();
    const data: Record<string, FormDataEntryValue | FormDataEntryValue[]> = Object.fromEntries(formData);

    // pet_friendly는 checkbox이므로 체크되지 않으면 FormData에 없음
    if (!data.pet_friendly) {
        data.pet_friendly = "off";
    }

    // amenities는 여러 개 선택될 수 있으므로 배열로 처리
    const amenities = formData.getAll("amenities");
    if (amenities.length > 0) {
        data.amenities = amenities;
    }

    // zod validation
    const validationResult = uploadRoomSchema.safeParse(data);
    if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        return {
            error: firstError.message,
            fieldErrors: validationResult.error.flatten().fieldErrors,
        };
    }

    try {
        // clientAction에서는 브라우저가 자동으로 쿠키를 처리하므로 별도 전달 불필요
        await updateRoom(roomPk, validationResult.data);

        // 성공 시 토스트 표시 후 리다이렉트
        return {
            success: true,
            roomId: roomPk,
        };
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error("Room update error:", error);
            if (error instanceof Error) {
                console.error("Error message:", error.message);
            }
        }
        const errorMessage = parseApiError(error, "Failed to update room. Please try again.");
        return {
            error: errorMessage,
        };
    }
}

export default function EditRoom({ loaderData }: Route.ComponentProps) {
    const { user, room, amenities, categories } = loaderData;
    const actionData = useActionData<typeof clientAction>();
    const navigation = useNavigation();
    const navigate = useNavigate();
    const isSubmitting = navigation.state === "submitting";

    // 업데이트 성공 시 토스트 표시 후 리다이렉트
    useEffect(() => {
        if (actionData?.success && actionData.roomId) {
            toaster.create({
                title: "Room updated successfully!",
                description: "Your room information has been updated.",
                type: "success",
                duration: 3000,
            });

            setTimeout(() => {
                navigate(`/rooms/${actionData.roomId}`);
            }, 500);
        }
    }, [actionData, navigate]);

    // categories가 paginated response인 경우 results 배열 사용
    const categoriesArray = Array.isArray(categories)
        ? categories
        : categories && typeof categories === "object" && "results" in categories
            ? ((categories as { results: ICategory[] }).results)
            : [];

    // amenities가 배열인지 확인하고, 아니면 빈 배열로 처리
    const amenitiesArray = Array.isArray(amenities) ? amenities : [];

    // 방의 현재 선택된 편의시설 ID 배열
    const selectedAmenityIds = room.amenities?.map((a) => a.pk) || [];

    return (
        <Box pb={40} mt={10} px={{ base: 10, lg: 40 }}>
            <Container maxW="container.lg">
                <Heading textAlign="center" size="xl" mb={8}>
                    Edit Room
                </Heading>
                <Form method="post">
                    <VStack gap={5} mt={5}>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Room Name</Text>
                            <Input name="name" type="text" required defaultValue={room.name} />
                            <Text fontSize="sm" color="gray.500" mt={1}>Please enter the room name.</Text>
                            {actionData?.fieldErrors?.name && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.name[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Country</Text>
                            <Input name="country" type="text" required defaultValue={room.country} />
                            {actionData?.fieldErrors?.country && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.country[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">City</Text>
                            <Input name="city" type="text" required defaultValue={room.city} />
                            {actionData?.fieldErrors?.city && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.city[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Address</Text>
                            <Input name="address" type="text" required defaultValue={room.address} />
                            {actionData?.fieldErrors?.address && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.address[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Price</Text>
                            <Box position="relative">
                                <Input name="price" type="number" min={0} pl="10" required defaultValue={room.price} />
                                <Box
                                    position="absolute"
                                    insetY="0"
                                    left="3"
                                    display="flex"
                                    alignItems="center"
                                    color="gray.400"
                                    pointerEvents="none"
                                >
                                    <FaDollarSign size={14} />
                                </Box>
                            </Box>
                            {actionData?.fieldErrors?.price && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.price[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Rooms</Text>
                            <Box position="relative">
                                <Input name="rooms" type="number" min={0} pl="10" required defaultValue={room.rooms} />
                                <Box
                                    position="absolute"
                                    insetY="0"
                                    left="3"
                                    display="flex"
                                    alignItems="center"
                                    color="gray.400"
                                    pointerEvents="none"
                                >
                                    <FaBed size={18} />
                                </Box>
                            </Box>
                            {actionData?.fieldErrors?.rooms && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.rooms[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Toilets</Text>
                            <Box position="relative">
                                <Input name="toilets" type="number" min={0} pl="10" required defaultValue={room.toilets} />
                                <Box
                                    position="absolute"
                                    insetY="0"
                                    left="3"
                                    display="flex"
                                    alignItems="center"
                                    color="gray.400"
                                    pointerEvents="none"
                                >
                                    <FaToilet size={18} />
                                </Box>
                            </Box>
                            {actionData?.fieldErrors?.toilets && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.toilets[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Beds</Text>
                            <Box position="relative">
                                <Input name="beds" type="number" min={0} pl="10" required defaultValue={room.beds} />
                                <Box
                                    position="absolute"
                                    insetY="0"
                                    left="3"
                                    display="flex"
                                    alignItems="center"
                                    color="gray.400"
                                    pointerEvents="none"
                                >
                                    <FaBed size={18} />
                                </Box>
                            </Box>
                            {actionData?.fieldErrors?.beds && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.beds[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Description</Text>
                            <Textarea name="description" required defaultValue={room.description} />
                            {actionData?.fieldErrors?.description && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.description[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <label
                                htmlFor="pet_friendly"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer",
                                    userSelect: "none",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    name="pet_friendly"
                                    value="on"
                                    id="pet_friendly"
                                    defaultChecked={room.pet_friendly}
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        cursor: "pointer",
                                    }}
                                />
                                <Text>Pet Friendly</Text>
                            </label>
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Room Type</Text>
                            <Box
                                as="select"
                                {...({ name: "kind", required: true } as any)}
                                w="100%"
                                p={2}
                                borderWidth="1px"
                                borderRadius="md"
                                defaultValue={room.kind}
                            >
                                <option value="">Please select a room type</option>
                                <option value="entire_place">Entire Place</option>
                                <option value="private_room">Private Room</option>
                                <option value="shared_room">Shared Room</option>
                            </Box>
                            <Text fontSize="sm" color="gray.500" mt={1}>What type of room are you offering?</Text>
                            {actionData?.fieldErrors?.kind && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.kind[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Category</Text>
                            <Box
                                as="select"
                                {...({ name: "category", required: true } as any)}
                                w="100%"
                                p={2}
                                borderWidth="1px"
                                borderRadius="md"
                                defaultValue={room.category?.pk}
                            >
                                <option value="">Please select a category</option>
                                {categoriesArray.map((category) => (
                                    <option key={category.pk} value={category.pk}>
                                        {category.name}
                                    </option>
                                ))}
                            </Box>
                            <Text fontSize="sm" color="gray.500" mt={1}>What category describes your room?</Text>
                            {actionData?.fieldErrors?.category && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.category[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Amenities</Text>
                            <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                                {amenitiesArray.map((amenity) => (
                                    <Box key={amenity.pk}>
                                        <label
                                            htmlFor={`amenity-${amenity.pk}`}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                cursor: "pointer",
                                                userSelect: "none",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                name="amenities"
                                                value={amenity.pk}
                                                id={`amenity-${amenity.pk}`}
                                                defaultChecked={selectedAmenityIds.includes(amenity.pk)}
                                                style={{
                                                    width: "18px",
                                                    height: "18px",
                                                    cursor: "pointer",
                                                }}
                                            />
                                            <Text fontWeight="medium">{amenity.name}</Text>
                                        </label>
                                        {amenity.description && (
                                            <Text fontSize="sm" color="gray.500" mt={1} ml={6}>
                                                {amenity.description}
                                            </Text>
                                        )}
                                    </Box>
                                ))}
                            </SimpleGrid>
                            {actionData?.fieldErrors?.amenities && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.amenities[0]}</Text>
                            )}
                        </Box>
                        {actionData?.error && (
                            <Box color="red.500" fontSize="sm" w="100%">
                                {actionData.error}
                            </Box>
                        )}
                        <Button
                            type="submit"
                            colorPalette="red"
                            w="100%"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Updating..." : "Update Room"}
                        </Button>
                    </VStack>
                </Form>
            </Container>
        </Box>
    );
}

