import { Form, redirect, useActionData, useNavigation } from "react-router";
import { useState, useRef } from "react";

import type { Route } from "./+types/$roomPk.photos";

import {
    Box,
    Button,
    Container,
    Heading,
    Image,
    Input,
    Textarea,
    VStack,
    Text,
    HStack,
} from "@chakra-ui/react";
import { FaCamera, FaUpload, FaImage } from "react-icons/fa";
import { getRoom, uploadRoomPhoto } from "~/utils/api";
import { parseApiError } from "~/utils/error";
import { requireHost } from "~/utils/auth";

export async function loader({ request, params }: Route.LoaderArgs) {
    await requireHost(request);
    const roomPk = params.roomPk;

    if (!roomPk) {
        throw new Response("Room ID is required", { status: 400 });
    }

    try {
        const cookie = request.headers.get("Cookie");
        const room = await getRoom(roomPk, cookie || undefined);

        if (!room.is_owner) {
            throw new Response("You are not the owner of this room", { status: 403 });
        }

        return { room };
    } catch (error) {
        if (error instanceof Response) {
            throw error;
        }
        throw new Response("Failed to load room", { status: 500 });
    }
}

export async function action({ request, params }: Route.ActionArgs) {
    await requireHost(request);
    const roomPk = params.roomPk;

    if (!roomPk) {
        return {
            error: "Room ID is required",
        };
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const description = (formData.get("description") as string) || "";

    if (!file) {
        return {
            error: "Please select a file to upload",
        };
    }

    // 파일이 비어있는지 확인
    if (file.size === 0) {
        return {
            error: "The selected file is empty. Please select a valid image file.",
        };
    }

    try {
        const cookie = request.headers.get("Cookie");
        await uploadRoomPhoto(Number(roomPk), file, description, cookie || undefined);

        return redirect(`/rooms/${roomPk}`);
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error("Photo upload error:", error);
        }
        const errorMessage = parseApiError(error, "Failed to upload photo. Please try again.");
        return {
            error: errorMessage,
        };
    }
}

export default function UploadPhotos({ loaderData }: Route.ComponentProps) {
    const { room } = loaderData;
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [description, setDescription] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            // 파일이 선택되지 않았을 때 상태 리셋
            setSelectedFile(null);
            setPreview(null);
        }
    };

    return (
        <Box pb={40} mt={10} px={{ base: 10, lg: 40 }}>
            <Container maxW="container.lg">
                <VStack gap={8}>
                    <VStack gap={2}>
                        <HStack gap={2}>
                            <FaCamera size={24} />
                            <Heading textAlign="center" size="xl">
                                Upload a Photo
                            </Heading>
                        </HStack>
                        <Text color="gray.600" fontSize="sm">
                            Add a photo to your room listing
                        </Text>
                    </VStack>

                    <Form method="post" encType="multipart/form-data" style={{ width: "100%" }}>
                        <VStack gap={5} mt={5}>
                            <Box w="100%">
                                <Box
                                    borderWidth="2px"
                                    borderStyle="dashed"
                                    borderColor={preview ? "gray.300" : "gray.400"}
                                    borderRadius="lg"
                                    p={8}
                                    textAlign="center"
                                    bg={preview ? "gray.50" : "transparent"}
                                    transition="all 0.2s"
                                    _hover={{
                                        borderColor: "red.400",
                                        bg: "gray.50",
                                    }}
                                >
                                    {preview ? (
                                        <VStack gap={4}>
                                            <Image
                                                src={preview}
                                                alt="Preview"
                                                maxH="300px"
                                                maxW="100%"
                                                borderRadius="md"
                                                objectFit="contain"
                                            />
                                            <Text fontSize="sm" color="gray.600">
                                                {selectedFile?.name}
                                            </Text>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    setPreview(null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = "";
                                                    }
                                                }}
                                            >
                                                Change Photo
                                            </Button>
                                        </VStack>
                                    ) : (
                                        <VStack gap={4}>
                                            <Box>
                                                <FaImage size={48} color="gray" />
                                            </Box>
                                            <VStack gap={2}>
                                                <Text fontWeight="medium" fontSize="md">
                                                    Click to upload or drag and drop
                                                </Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    PNG, JPG, GIF up to 10MB
                                                </Text>
                                            </VStack>
                                        </VStack>
                                    )}
                                    <Input
                                        ref={fileInputRef}
                                        name="file"
                                        type="file"
                                        accept="image/*"
                                        required
                                        onChange={handleFileChange}
                                        position="absolute"
                                        top={0}
                                        left={0}
                                        width="100%"
                                        height="100%"
                                        opacity={0}
                                        cursor="pointer"
                                        style={{ position: "absolute" }}
                                    />
                                </Box>
                            </Box>

                            <Box w="100%">
                                <Text mb={2} fontWeight="medium">
                                    Photo Description (Optional)
                                </Text>
                                <Textarea
                                    name="description"
                                    placeholder="Describe this photo..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                />
                                <Text fontSize="sm" color="gray.500" mt={1}>
                                    Add a description to help guests understand this photo
                                </Text>
                            </Box>

                            {actionData?.error && (
                                <Box
                                    color="red.500"
                                    fontSize="sm"
                                    w="100%"
                                    p={3}
                                    bg="red.50"
                                    borderRadius="md"
                                    borderWidth="1px"
                                    borderColor="red.200"
                                >
                                    {actionData.error}
                                </Box>
                            )}

                            <Button
                                type="submit"
                                colorPalette="red"
                                w="100%"
                                size="lg"
                                loading={isSubmitting}
                                disabled={isSubmitting || !selectedFile}
                            >
                                <HStack gap={2}>
                                    <FaUpload />
                                    <Text>
                                        {isSubmitting ? "Uploading..." : "Upload Photo"}
                                    </Text>
                                </HStack>
                            </Button>
                        </VStack>
                    </Form>
                </VStack>
            </Container>
        </Box>
    );
}

