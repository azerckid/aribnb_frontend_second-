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
import { FaBed, FaMoneyBill, FaToilet } from "react-icons/fa";
import { parseApiError } from "~/utils/error";
import { requireHost } from "~/utils/auth";
import { uploadRoom } from "~/utils/api";
import { uploadRoomSchema } from "~/utils/validation";


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
        const errorMessage = parseApiError(error, "방 업로드에 실패했습니다. 다시 시도해주세요.");
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
                    방 업로드
                </Heading>
                <Form method="post">
                    <VStack gap={5} mt={5}>
                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">방 이름</Text>
                            <Input name="name" type="text" required />
                            <Text fontSize="sm" color="gray.500" mt={1}>방 이름을 입력해주세요.</Text>
                            {actionData?.fieldErrors?.name && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.name[0]}</Text>
                            )}
                        </Box>

                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">국가</Text>
                            <Input name="country" type="text" required />
                            {actionData?.fieldErrors?.country && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.country[0]}</Text>
                            )}
                        </Box>

                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">도시</Text>
                            <Input name="city" type="text" required />
                            {actionData?.fieldErrors?.city && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.city[0]}</Text>
                            )}
                        </Box>

                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">주소</Text>
                            <Input name="address" type="text" required />
                            {actionData?.fieldErrors?.address && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.address[0]}</Text>
                            )}
                        </Box>

                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">가격</Text>
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
                                    <FaMoneyBill size={18} />
                                </Box>
                            </Box>
                            {actionData?.fieldErrors?.price && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.price[0]}</Text>
                            )}
                        </Box>

                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">방 개수</Text>
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
                            <Text mb={2} fontWeight="medium">화장실 개수</Text>
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
                            <Text mb={2} fontWeight="medium">설명</Text>
                            <Textarea name="description" required />
                            {actionData?.fieldErrors?.description && (
                                <Text fontSize="sm" color="red.500" mt={1}>{actionData.fieldErrors.description[0]}</Text>
                            )}
                        </Box>

                        <Box w="100%">
                            <Checkbox.Root name="pet_friendly" value="on">
                                <Checkbox.Control />
                                <Checkbox.Label>반려동물 허용</Checkbox.Label>
                            </Checkbox.Root>
                        </Box>

                        <Box w="100%">
                            <Text mb={2} fontWeight="medium">방 종류</Text>
                            <Box
                                as="select"
                                {...({ name: "kind", required: true } as any)}
                                w="100%"
                                p={2}
                                borderWidth="1px"
                                borderRadius="md"
                            >
                                <option value="">방 종류를 선택해주세요</option>
                                <option value="entire_place">전체 공간</option>
                                <option value="private_room">개인실</option>
                                <option value="shared_room">공유실</option>
                            </Box>
                            <Text fontSize="sm" color="gray.500" mt={1}>어떤 종류의 방을 제공하시나요?</Text>
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
                            {isSubmitting ? "업로드 중..." : "방 업로드"}
                        </Button>
                    </VStack>
                </Form>
            </Container>
        </Box>
    );
}

