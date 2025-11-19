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

    useEffect(() => {
        if (!actionData?.success || navigation.state !== "idle") return;

        if (actionData.action === "upload") {
            toaster.create({
                title: "Photo uploaded successfully!",
                description: "Your photo has been uploaded and is now visible.",
                type: "success",
                duration: 3000,
            });
            setShowUploadForm(false);
            setSelectedFile(null);
            setPreview(null);
            setDescription("");
        } else if (actionData.action === "delete") {
            toaster.create({
                title: "Photo deleted successfully!",
                description: "The photo has been removed from your room.",
                type: "success",
                duration: 3000,
            });
        }

        revalidator.revalidate();
    }, [actionData?.success, actionData?.action, navigation.state]);

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
        setDeletePhotoPk(photoPk);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        if (!deletePhotoPk) return;
        setShowDeleteModal(false);
        const form = document.getElementById("delete-photo-form") as HTMLFormElement;
        if (form) {
            const photoPkInput = form.querySelector('input[name="photoPk"]') as HTMLInputElement;
            if (photoPkInput) {
                photoPkInput.value = deletePhotoPk;
                form.submit();
            }
        }
    };

    const displayPhotos = room.photos.slice(0, 5);

    return (
        <Box
            mt={{ base: 5, md: 10 }}
            pb={{ base: 20, md: 40 }}
            px={{
                base: 4,
                md: 6,
                lg: 0,
            }}
        >
            <DialogRoot open={showDeleteModal} onOpenChange={(e) => {
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

            <Form method="post" id="delete-photo-form" style={{ display: "none" }}>
                <Input type="hidden" name="intent" value="delete" />
                <Input type="hidden" name="photoPk" value={deletePhotoPk || ""} />
            </Form>

            <Box
                display="flex"
                flexDirection={{ base: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ base: "flex-start", md: "center" }}
                gap={{ base: 3, md: 0 }}
                mb={4}
                w="100%"
            >
                {isLoading ? (
                    <Skeleton height="43px" width={{ base: "100%", md: "25%" }} />
                ) : (
                    <Heading fontSize={{ base: "xl", md: "2xl" }}>{room.name}</Heading>
                )}
                {room.is_owner && (
                    <Button
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        colorPalette="red"
                        size={{ base: "sm", md: "md" }}
                        w={{ base: "100%", md: "auto" }}
                    >
                        <HStack gap={2}>
                            <FaCamera />
                            <Text>{showUploadForm ? "Cancel Upload" : "Upload Photo"}</Text>
                        </HStack>
                    </Button>
                )}
            </Box>

            {showUploadForm && room.is_owner && (
                <Box mb={8} p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" bg="gray.50">
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
                    <Box mt={{ base: 4, md: 8 }} rounded="xl" overflow="hidden" position="relative">
                        {room.is_owner && displayPhotos[0] && (
                            <Button
                                position="absolute"
                                top={2}
                                right={2}
                                zIndex={10}
                                size="sm"
                                variant="ghost"
                                bg="transparent"
                                _hover={{ bg: "rgba(0, 0, 0, 0.1)" }}
                                onClick={() => handleDeleteClick(displayPhotos[0].pk)}
                                aria-label="Delete photo"
                            >
                                <FaTrash color="red" />
                            </Button>
                        )}
                        {displayPhotos[0] && displayPhotos[0].file && displayPhotos[0].file.trim() !== "" ? (
                            isLoading ? (
                                <Skeleton h={{ base: "50vh", md: "60vh" }} w="100%" />
                            ) : (
                                <Image
                                    objectFit="cover"
                                    w="100%"
                                    h={{ base: "50vh", md: "60vh" }}
                                    src={displayPhotos[0].file}
                                    alt={displayPhotos[0].description || room.name}
                                    loading="lazy"
                                />
                            )
                        ) : null}
                    </Box>
                ) : (
                    <VStack
                        mt={{ base: 4, md: 8 }}
                        gap={{ base: 3, md: 2 }}
                        display={{ base: "flex", md: "none" }}
                    >
                        {displayPhotos.map((photo) => {
                            if (!photo || !photo.file || photo.file.trim() === "") return null;
                            return (
                                <Box
                                    key={photo.pk}
                                    w="100%"
                                    rounded="xl"
                                    overflow="hidden"
                                    position="relative"
                                    h={{ base: "60vh", sm: "50vh" }}
                                >
                                    {room.is_owner && (
                                        <Button
                                            position="absolute"
                                            top={2}
                                            right={2}
                                            zIndex={10}
                                            size="sm"
                                            variant="ghost"
                                            bg="transparent"
                                            _hover={{ bg: "rgba(0, 0, 0, 0.1)" }}
                                            onClick={() => handleDeleteClick(photo.pk)}
                                            aria-label="Delete photo"
                                        >
                                            <FaTrash color="red" />
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
                    </VStack>
                )
            )}

            {displayPhotos.length > 1 && (
                <Grid
                    mt={{ base: 4, md: 8 }}
                    rounded="xl"
                    overflow="hidden"
                    gap={2}
                    height="60vh"
                    templateRows="1fr 1fr"
                    templateColumns="repeat(4, 1fr)"
                    display={{ base: "none", md: "grid" }}
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
                                        variant="ghost"
                                        bg="transparent"
                                        _hover={{ bg: "rgba(0, 0, 0, 0.1)" }}
                                        onClick={() => handleDeleteClick(photo.pk)}
                                        aria-label="Delete photo"
                                    >
                                        <FaTrash color="red" />
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
            )}

            <HStack
                w={{ base: "100%", md: "40%" }}
                justifyContent="space-between"
                alignItems={{ base: "flex-start", md: "center" }}
                mt={{ base: 6, md: 10 }}
                flexDirection={{ base: "column", md: "row" }}
                gap={{ base: 4, md: 0 }}
            >
                <VStack alignItems="flex-start" w={{ base: "100%", md: "auto" }}>
                    {isLoading ? (
                        <Skeleton height="30px" width={{ base: "100%", md: "300px" }} />
                    ) : (
                        <Heading fontSize={{ base: "xl", md: "2xl" }}>
                            House hosted by {room.owner.name}
                        </Heading>
                    )}
                    {isLoading ? (
                        <Skeleton height="30px" width={{ base: "100%", md: "200px" }} />
                    ) : (
                        <VStack alignItems="flex-start" gap={2} w="100%">
                            <HStack justifyContent="flex-start" w="100%" flexWrap="wrap">
                                <Text fontSize={{ base: "sm", md: "md" }}>
                                    {room.toilets} toilet{room.toilets === 1 ? "" : "s"}
                                </Text>
                                <Text fontSize={{ base: "sm", md: "md" }}>∙</Text>
                                <Text fontSize={{ base: "sm", md: "md" }}>
                                    {room.rooms} room{room.rooms === 1 ? "" : "s"}
                                </Text>
                                {room.beds !== undefined && (
                                    <>
                                        <Text fontSize={{ base: "sm", md: "md" }}>∙</Text>
                                        <Text fontSize={{ base: "sm", md: "md" }}>
                                            {room.beds} bed{room.beds === 1 ? "" : "s"}
                                        </Text>
                                    </>
                                )}
                            </HStack>
                            {room.category && (
                                <Box>
                                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" fontWeight="medium">
                                        Category: <Text as="span" fontWeight="bold">{room.category.name}</Text>
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    )}
                </VStack>
                {isLoading ? (
                    <Skeleton width={{ base: "60px", md: "80px" }} height={{ base: "60px", md: "80px" }} rounded="full" />
                ) : (
                    <Avatar.Root size={{ base: "lg", md: "xl" }}>
                        <Avatar.Image src={room.owner.avatar} alt={room.owner.name} />
                        <Avatar.Fallback name={room.owner.name} />
                    </Avatar.Root>
                )}
            </HStack>

            {room.amenities && room.amenities.length > 0 && (
                <Box mt={{ base: 6, md: 10 }}>
                    <Heading fontSize={{ base: "xl", md: "2xl" }} mb={5}>
                        What this place offers
                    </Heading>
                    <Grid
                        templateColumns={{
                            base: "1fr",
                            md: "1fr 1fr",
                            lg: "1fr 1fr 1fr",
                        }}
                        gap={{ base: 3, md: 4 }}
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
                <Box mt={{ base: 6, md: 10 }}>
                    <Heading fontSize={{ base: "xl", md: "2xl" }} mb={5}>
                        About this place
                    </Heading>
                    <Text fontSize={{ base: "sm", md: "md" }} color="gray.700" lineHeight="tall" whiteSpace="pre-line">
                        {room.description}
                    </Text>
                </Box>
            )}

            <Box mt={{ base: 6, md: 10 }}>
                <Heading fontSize={{ base: "xl", md: "2xl" }} mb={5}>
                    <HStack gap={2} flexWrap="wrap">
                        <FaStar /> <Text>{room.rating}</Text>
                        <Text>∙</Text>
                        <Text>
                            {reviews.length} review{reviews.length === 1 ? "" : "s"}
                        </Text>
                    </HStack>
                </Heading>

                {reviews.length > 0 && (
                    <Container mt={{ base: 8, md: 16 }} maxW="container.lg" mx="0" px={{ base: 0, md: 4 }}>
                        <Grid
                            templateColumns={{
                                base: "1fr",
                                md: "1fr 1fr",
                            }}
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
                )}
            </Box>
        </Box>
    );
}

