import { Form, redirect, useActionData, useNavigation, useNavigate } from "react-router";

import type { Route } from "./+types/upload";

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
import type { IAmenity, ICategory } from "~/types";
import { toaster } from "~/components/ui/toaster";
import { getAmenities, getCategories, uploadRoom } from "~/utils/api";
import { parseApiError } from "~/utils/error";
import { uploadRoomSchema } from "~/utils/validation";
import { requireHost } from "~/utils/auth";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
    // 호스트 권한 체크 (로그인 체크 포함)
    const user = await requireHost(request);

    // 편의시설과 카테고리 데이터를 병렬로 가져오기
    try {
        const [amenities, categories] = await Promise.all([
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

        if (import.meta.env.DEV) {
            const categoriesArray = Array.isArray(categories)
                ? categories
                : categories && typeof categories === "object" && "results" in categories
                    ? (categories as { results: ICategory[] }).results
                    : [];
            console.log("Loader data:", {
                amenitiesCount: amenities.length,
                categoriesCount: categoriesArray.length,
                categoriesType: Array.isArray(categories) ? "array" : typeof categories,
                categoriesKeys: categories && typeof categories === "object" ? Object.keys(categories) : [],
            });
        }

        return { user, amenities, categories };
    } catch (error) {
        // 에러가 발생해도 빈 배열로 처리하여 페이지는 표시
        if (import.meta.env.DEV) {
            console.error("Loader error:", error);
        }
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return { user, amenities: [], categories: [], error: errorMessage };
    }
}

export async function action({ request }: Route.ActionArgs) {
    // 호스트 권한 체크
    const user = await requireHost(request);

    const formData = await request.formData();
    const data: Record<string, FormDataEntryValue | FormDataEntryValue[]> = Object.fromEntries(formData);

    // pet_friendly는 checkbox이므로 체크되지 않으면 FormData에 없음
    // 체크되지 않은 경우 false로 설정
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
        // request에서 쿠키를 가져와서 API 호출에 전달
        const cookie = request.headers.get("Cookie");
        const room = await uploadRoom(validationResult.data, cookie || undefined);

        // 성공 시 방 정보와 함께 성공 상태 반환 (토스트 표시 후 리다이렉트)
        return {
            success: true,
            roomId: room.id || room.pk,
        };
    } catch (error) {
        // 개발 환경에서 원본 에러 로깅
        if (import.meta.env.DEV) {
            console.error("Room upload error:", error);
            if (error instanceof Error) {
                console.error("Error message:", error.message);
            }
        }
        const errorMessage = parseApiError(error, "Failed to upload room. Please try again.");
        return {
            error: errorMessage,
        };
    }
}

export default function UploadRoom({ loaderData }: Route.ComponentProps) {
    const { user, amenities, categories } = loaderData;
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const navigate = useNavigate();
    const isSubmitting = navigation.state === "submitting";

    // 업로드 성공 시 토스트 표시 후 리다이렉트
    useEffect(() => {
        if (actionData?.success && actionData.roomId) {
            toaster.create({
                title: "Room uploaded successfully!",
                description: "Your room has been uploaded and is now live.",
                type: "success",
                duration: 3000,
            });

            // 토스트가 표시된 후 리다이렉트
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

    // amenities가 배열인지 확인하고, 아니면 빈 배열로 처리 (pagination 대응)
    const amenitiesArray = Array.isArray(amenities)
        ? amenities
        : amenities && typeof amenities === "object" && "results" in amenities
            ? ((amenities as { results: IAmenity[] }).results)
            : [];

    return (
        <Box pb={40} mt={10} px={{ base: 10, lg: 40 }}>
            <Container maxW="container.lg">
                <Heading textAlign="center" size="xl" mb={8}>
                    Upload Room
                </Heading>

                {/* Debug Info - Remove after fixing */}
                <Box p={4} mb={4} bg="gray.100" borderRadius="md" fontSize="xs">
                    <Text fontWeight="bold">Debug Info:</Text>
                    <Text>Loader Error: {(loaderData as any).error || "None"}</Text>
                    <Text>Amenities Type: {Array.isArray(amenities) ? "Array" : typeof amenities}</Text>
                    <Text>Amenities Count: {amenitiesArray.length}</Text>
                    <Text>Categories Type: {Array.isArray(categories) ? "Array" : typeof categories}</Text>
                    <Text>Categories Count: {categoriesArray.length}</Text>
                    <Text>Raw Amenities: {JSON.stringify(amenities).slice(0, 100)}</Text>
                    <Text>Raw Categories: {JSON.stringify(categories).slice(0, 100)}</Text>
                </Box>

                <Form method="post">
                    <VStack gap={5} mt={5}>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Room Name</Text>
                            <Input name="name" type="text" required />
                            <Text fontSize="sm" color="gray.500" mt={1}>Please enter the room name.</Text>
                            {actionData?.fieldErrors?.name && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.name[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Country</Text>
                            <Input name="country" type="text" required />
                            {actionData?.fieldErrors?.country && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.country[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">City</Text>
                            <Input name="city" type="text" required />
                            {actionData?.fieldErrors?.city && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.city[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Address</Text>
                            <Input name="address" type="text" required />
                            {actionData?.fieldErrors?.address && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.address[0]}</Text>
                            )}
                        </Box>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">Price</Text>
                            <Box position="relative">
                                <Input name="price" type="number" min={0} pl="10" required />
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
                                <Input name="rooms" type="number" min={0} pl="10" required />
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
                                <Input name="toilets" type="number" min={0} pl="10" required />
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
                                <Input name="beds" type="number" min={0} pl="10" required />
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
                            <Textarea name="description" required />
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
                            {isSubmitting ? "Uploading..." : "Upload Room"}
                        </Button>
                    </VStack>
                </Form>
            </Container>
        </Box>
    );
}

