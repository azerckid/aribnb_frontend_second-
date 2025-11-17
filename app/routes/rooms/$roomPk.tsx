import type { Route } from "./+types/$roomPk";
import { getRoom } from "~/utils/api";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Room Detail | Guest House Booking" },
        { name: "description", content: "Room detail page" },
    ];
}

export async function loader({ params }: Route.LoaderArgs) {
    try {
        const room = await getRoom(params.roomPk);
        return { room };
    } catch (error) {
        console.error("Failed to fetch room:", error);
        throw new Response("Room not found", { status: 404 });
    }
}

export default function RoomDetail({ loaderData }: Route.ComponentProps) {
    const { room } = loaderData;

    return (
        <div>
            <h1>{room.name}</h1>
            <p>{room.city}, {room.country}</p>
            <p>${room.price} / night</p>
            <p>Rating: {room.rating}</p>
            <p>Photos: {room.photos.map((photo) => photo.file).join(", ")}</p>
            <p>Owner: {room.owner.name}</p>
            <p>Amenities: {room.amenities.map((amenity) => amenity.name).join(", ")}</p>
            <p>Category: {room.category.name}</p>
            <p>Beds: {room.beds.length}</p>
            <p>Rooms: {room.rooms}</p>
            <p>Toilets: {room.toilets}</p>
            <p>Description: {room.description}</p>
            <p>Address: {room.address}</p>
            <p>Pet Friendly: {room.pet_friendly ? "Yes" : "No"}</p>
            <p>Kind: {room.kind}</p>
            <p>Created At: {room.created_at}</p>
            <p>Updated At: {room.updated_at}</p>

        </div>
    );
}

