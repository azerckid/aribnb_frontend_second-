import { useNavigation, Form as RouterForm, useActionData, useRevalidator, Link } from "react-router";
import { useState, useEffect } from "react";

import type { Route } from "./+types/$roomPk";

import { Box, Button, Grid, HStack, Heading, Input, Skeleton, Text } from "@chakra-ui/react";
import { FaCamera, FaEdit } from "react-icons/fa";
import { requireHost } from "~/utils/auth";
import { parseApiError } from "~/utils/error";
import { toaster } from "~/components/ui/toaster";
import { getRoom, getRoomReviews, uploadRoomPhoto, deleteRoomPhoto } from "~/utils/api";
import { RoomReviews } from "~/components/rooms/RoomReviews";
import { RoomHostInfo } from "~/components/rooms/RoomHostInfo";
import { RoomAmenities } from "~/components/rooms/RoomAmenities";
import { RoomDescription } from "~/components/rooms/RoomDescription";
import { RoomPhotoUpload } from "~/components/rooms/RoomPhotoUpload";
import { RoomPhotoGallery } from "~/components/rooms/RoomPhotoGallery";
import { RoomBookingCalendar } from "~/components/rooms/RoomBookingCalendar";
import { RoomPhotoDeleteModal } from "~/components/rooms/RoomPhotoDeleteModal";

export function meta({ data }: Route.MetaArgs) {
    const roomName = data?.room?.name;
    return [
        { title: roomName ? `${roomName} | Guest House Booking` : "Room Detail | Guest House Booking" },
        { name: "description", content: roomName ? `Book ${roomName} - Guest House Booking` : "Room detail page" },
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
        } else if (actionData.action === "delete") {
            toaster.create({
                title: "Photo deleted successfully!",
                description: "The photo has been removed from your room.",
                type: "success",
                duration: 3000,
            });
        }

        revalidator.revalidate();
    }, [actionData?.success, actionData?.action, navigation.state, revalidator]);

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
            <RoomPhotoDeleteModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeletePhotoPk(null);
                }}
                onConfirm={handleDeleteConfirm}
            />

            <RouterForm method="post" id="delete-photo-form" style={{ display: "none" }}>
                <Input type="hidden" name="intent" value="delete" />
                <Input type="hidden" name="photoPk" value={deletePhotoPk || ""} />
            </RouterForm>

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
                    <HStack gap={2}>
                        <Button
                            asChild
                            colorPalette="blue"
                            size={{ base: "sm", md: "md" }}
                            w={{ base: "100%", md: "auto" }}
                        >
                            <Link to={`/rooms/${room.pk || room.id}/edit`}>
                                <HStack gap={2}>
                                    <FaEdit />
                                    <Text>Edit Room</Text>
                                </HStack>
                            </Link>
                        </Button>
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
                    </HStack>
                )}
            </Box>

            {showUploadForm && room.is_owner && <RoomPhotoUpload actionData={actionData} />}

            <RoomPhotoGallery
                photos={room.photos}
                room={room}
                isLoading={isLoading}
                onDeleteClick={handleDeleteClick}
            />

            <RoomHostInfo room={room} isLoading={isLoading} />

            <RoomAmenities amenities={room.amenities || []} />

            <RoomDescription description={room.description || ""} />

            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={{ base: 6, md: 10 }}
                mt={{ base: 8, md: 16 }}
            >
                <RoomReviews reviews={reviews} rating={room.rating} />
                {room.pk && <RoomBookingCalendar roomPk={room.pk} />}
            </Grid>
        </Box>
    );
}

