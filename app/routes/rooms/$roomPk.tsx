import type { Route } from "./+types/$roomPk";
import { getRoom, getRoomReviews, uploadRoomPhoto, deleteRoomPhoto } from "~/utils/api";
import { Box, Container, Grid, HStack, Heading, Image, Skeleton, Text, VStack, Button, Input, Textarea, DialogRoot, DialogBackdrop, DialogPositioner, DialogContent, DialogHeader, DialogBody, DialogFooter } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { useNavigation, Form, useActionData, useRevalidator } from "react-router";
import { FaStar, FaCamera, FaTrash, FaUpload } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { parseApiError } from "~/utils/error";
import { requireHost } from "~/utils/auth";
import { toaster } from "~/components/ui/toaster";

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

export async function action({ request, params }: Route.ActionArgs) {
    const roomPk = params.roomPk;
    if (!roomPk) {
        return { error: "Room ID is required" };
    }

    try {
        const user = await requireHost(request);
        const cookie = request.headers.get("Cookie");
        const formData = await request.formData();
        const intent = formData.get("intent") as string;

        if (intent === "upload") {
            const file = formData.get("file") as File | null;
            const description = (formData.get("description") as string) || "";

            if (!file || file.size === 0) {
                return { error: "Please select a valid image file" };
            }

            await uploadRoomPhoto(Number(roomPk), file, description, cookie || undefined);
            return { success: true, action: "upload", message: "Photo uploaded successfully" };
        } else if (intent === "delete") {
            const photoPk = formData.get("photoPk") as string;
            if (!photoPk) {
                return { error: "Photo ID is required" };
            }

            await deleteRoomPhoto(photoPk, cookie || undefined);
            return { success: true, action: "delete", message: "Photo deleted successfully" };
        }

        return { error: "Invalid action" };
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error("Photo action error:", error);
        }
        const errorMessage = parseApiError(error, "Failed to perform action. Please try again.");
        return { error: errorMessage };
    }
}

export default function RoomDetail({ loaderData }: Route.ComponentProps) {
    const { room, reviews } = loaderData;
    const navigation = useNavigation();
    const actionData = useActionData<typeof action>();
    const revalidator = useRevalidator();
    const isLoading = navigation.state === "loading";
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [description, setDescription] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deletePhotoPk, setDeletePhotoPk] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // 업로드/삭제 성공 시 데이터 재로드 및 토스트 표시
    useEffect(() => {
        if (actionData?.success && navigation.state === "idle") {
            // 토스트 메시지 표시
            if (actionData.action === "upload") {
                toaster.create({
                    title: "Photo uploaded successfully!",
                    description: "Your photo has been uploaded and is now visible.",
                    type: "success",
                    duration: 3000,
                });
            } else if (actionData.action === "delete") {
                toaster.create({
                    title: "Photo deleted successfully!",
                    description: "The photo has been removed from your room.",
                    type: "success",
                    duration: 3000,
                });
            }

            // 데이터 재로드
            revalidator.revalidate();

            // 업로드 폼 리셋
            if (actionData.action === "upload") {
                setShowUploadForm(false);
                setSelectedFile(null);
                setPreview(null);
                setDescription("");
            }
        }
    }, [actionData?.success, actionData?.action, navigation.state, revalidator]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteClick = (photoPk: string) => {
        if (import.meta.env.DEV) {
            console.log("Delete button clicked, photoPk:", photoPk);
        }
        setDeletePhotoPk(photoPk);
        setShowDeleteModal(true);
        if (import.meta.env.DEV) {
            console.log("showDeleteModal set to true");
        }
    };

    const handleDeleteConfirm = () => {
        if (deletePhotoPk) {
            setShowDeleteModal(false);
            // Form을 통해 삭제 요청 전송
            const form = document.getElementById("delete-photo-form") as HTMLFormElement;
            if (form) {
                const photoPkInput = form.querySelector('input[name="photoPk"]') as HTMLInputElement;
                if (photoPkInput) {
                    photoPkInput.value = deletePhotoPk;
                    form.submit();
                }
            }
        }
    };

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
            {/* 삭제 확인 모달 */}
            <DialogRoot open={showDeleteModal} onOpenChange={(e) => {
                if (import.meta.env.DEV) {
                    console.log("Dialog onOpenChange:", e.open);
                }
                setShowDeleteModal(e.open);
                if (!e.open) {
                    setDeletePhotoPk(null);
                }
            }}>
                <DialogBackdrop />
                <DialogPositioner>
                    <DialogContent>
                        <DialogHeader>
                            <Heading size="md">Delete Photo</Heading>
                        </DialogHeader>
                        <DialogBody>
                            <Text>Are you sure you want to delete this photo? This action cannot be undone.</Text>
                        </DialogBody>
                        <DialogFooter>
                            <HStack gap={2}>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletePhotoPk(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    colorPalette="red"
                                    onClick={handleDeleteConfirm}
                                >
                                    Delete
                                </Button>
                            </HStack>
                        </DialogFooter>
                    </DialogContent>
                </DialogPositioner>
            </DialogRoot>

            {/* 삭제용 숨겨진 Form */}
            <Form method="post" id="delete-photo-form" style={{ display: "none" }}>
                <Input type="hidden" name="intent" value="delete" />
                <Input type="hidden" name="photoPk" value={deletePhotoPk || ""} />
            </Form>

            <HStack justifyContent="space-between" alignItems="center" mb={4}>
                {isLoading ? (
                    <Skeleton height="43px" width="25%" />
                ) : (
                    <Heading>{room.name}</Heading>
                )}
                {room.is_owner && (
                    <Button
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        colorPalette="red"
                    >
                        <HStack gap={2}>
                            <FaCamera />
                            <Text>{showUploadForm ? "Cancel Upload" : "Upload Photo"}</Text>
                        </HStack>
                    </Button>
                )}
            </HStack>

            {showUploadForm && room.is_owner && (
                <Box mb={8} p={6} borderWidth="1px" borderRadius="lg" bg="gray.50">
                    <Form method="post" encType="multipart/form-data">
                        <VStack gap={4}>
                            <Input
                                type="hidden"
                                name="intent"
                                value="upload"
                            />
                            <Box w="100%">
                                <Text mb={2} fontWeight="medium">
                                    Select Photo
                                </Text>
                                <Box
                                    borderWidth="2px"
                                    borderStyle="dashed"
                                    borderColor={preview ? "gray.300" : "gray.400"}
                                    borderRadius="lg"
                                    p={4}
                                    textAlign="center"
                                    position="relative"
                                    cursor="pointer"
                                    _hover={{ borderColor: "red.400" }}
                                >
                                    {preview ? (
                                        <VStack gap={2}>
                                            <Image
                                                src={preview}
                                                alt="Preview"
                                                maxH="200px"
                                                maxW="100%"
                                                borderRadius="md"
                                                objectFit="contain"
                                            />
                                            <Text fontSize="sm" color="gray.600">
                                                {selectedFile?.name}
                                            </Text>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
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
                                        <VStack gap={2}>
                                            <FaCamera size={32} />
                                            <Text>Click to select a photo</Text>
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
                                    />
                                </Box>
                            </Box>
                            <Box w="100%">
                                <Text mb={2} fontWeight="medium">
                                    Description (Optional)
                                </Text>
                                <Textarea
                                    name="description"
                                    placeholder="Describe this photo..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </Box>
                            {actionData?.error && (
                                <Box
                                    color="red.500"
                                    fontSize="sm"
                                    w="100%"
                                    p={2}
                                    bg="red.50"
                                    borderRadius="md"
                                >
                                    {actionData.error}
                                </Box>
                            )}
                            <Button
                                type="submit"
                                colorPalette="red"
                                w="100%"
                                disabled={!selectedFile}
                            >
                                <HStack gap={2}>
                                    <FaUpload />
                                    <Text>Upload Photo</Text>
                                </HStack>
                            </Button>
                        </VStack>
                    </Form>
                </Box>
            )}

            {displayPhotos.length > 0 && (
                displayPhotos.length === 1 ? (
                    // 1개: 전체 너비
                    <Box mt={8} rounded="xl" overflow="hidden" position="relative">
                        {room.is_owner && displayPhotos[0] && (
                            <Button
                                position="absolute"
                                top={2}
                                right={2}
                                zIndex={10}
                                size="sm"
                                colorPalette="red"
                                onClick={() => handleDeleteClick(displayPhotos[0].pk)}
                                aria-label="Delete photo"
                            >
                                <FaTrash />
                            </Button>
                        )}
                        {displayPhotos[0] && displayPhotos[0].file && displayPhotos[0].file.trim() !== "" ? (
                            isLoading ? (
                                <Skeleton h="60vh" w="100%" />
                            ) : (
                                <Image
                                    objectFit="cover"
                                    w="100%"
                                    h="60vh"
                                    src={displayPhotos[0].file}
                                    alt={displayPhotos[0].description || room.name}
                                    loading="lazy"
                                />
                            )
                        ) : null}
                    </Box>
                ) : (
                    // 2개 이상: 첫 번째 사진 크게 (2x2), 나머지 작게 (2x2 그리드)
                    <Grid
                        mt={8}
                        rounded="xl"
                        overflow="hidden"
                        gap={2}
                        height="60vh"
                        templateRows="1fr 1fr"
                        templateColumns="repeat(4, 1fr)"
                    >
                        {displayPhotos.slice(0, 5).map((photo, index) => {
                            if (!photo || !photo.file || photo.file.trim() === "") return null;

                            const isFirst = index === 0;
                            return (
                                <Box
                                    key={photo.pk}
                                    gridColumn={isFirst ? "span 2" : "span 1"}
                                    gridRow={isFirst ? "span 2" : "span 1"}
                                    overflow="hidden"
                                    position="relative"
                                >
                                    {room.is_owner && (
                                        <Button
                                            position="absolute"
                                            top={2}
                                            right={2}
                                            zIndex={10}
                                            size="sm"
                                            colorPalette="red"
                                            onClick={() => handleDeleteClick(photo.pk)}
                                            aria-label="Delete photo"
                                        >
                                            <FaTrash />
                                        </Button>
                                    )}
                                    {isLoading ? (
                                        <Skeleton h="100%" w="100%" />
                                    ) : (
                                        <Image
                                            objectFit="cover"
                                            w="100%"
                                            h="100%"
                                            src={photo.file}
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

