import { Form, redirect, useActionData, useNavigation } from "react-router";

import type { Route } from "./+types/upload";

import {
    Box,
    Button,
    Checkbox,
    Container,
    Heading,
    Input,
    Textarea,
    VStack,
    Text,
} from "@chakra-ui/react";
import { FaBed, FaDollarSign, FaMoneyBill, FaToilet } from "react-icons/fa";
import { uploadRoom } from "~/utils/api";
import { parseApiError } from "~/utils/error";
import { uploadRoomSchema } from "~/utils/validation";
import { requireHost } from "~/utils/auth";

export async function loader({ request }: Route.LoaderArgs) {
    // 호스트 권한 체크 (로그인 체크 포함)
    const user = await requireHost(request);
    return { user };
}

export async function action({ request }: Route.ActionArgs) {
    // 호스트 권한 체크
    const user = await requireHost(request);

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // pet_friendly는 checkbox이므로 체크되지 않으면 FormData에 없음
    // 체크되지 않은 경우 false로 설정
    if (!data.pet_friendly) {
        data.pet_friendly = "off";
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
        const room = await uploadRoom(validationResult.data);

        // 성공 시 방 상세 페이지로 리다이렉트
        return redirect(`/rooms/${room.id || room.pk}`);
    } catch (error) {
        const errorMessage = parseApiError(error, "Failed to upload room. Please try again.");
        return {
            error: errorMessage,
        };
    }
}

export default function UploadRoom({ loaderData }: Route.ComponentProps) {
    const { user } = loaderData;
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <Box pb={40} mt={10} px={{ base: 10, lg: 40 }}>
            <Container maxW="container.lg">
                <Heading textAlign="center" size="xl" mb={8}>
                    Upload Room
                </Heading>
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

