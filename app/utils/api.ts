import type { IRoom } from "~/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const res = await fetch(url, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
        ...init,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
}

export async function getRooms(): Promise<IRoom[]> {
    return apiGet<IRoom[]>("/rooms/");
}

export async function getRoom(roomPk: number | string): Promise<IRoom> {
    return apiGet<IRoom>(`/rooms/${roomPk}`);
}

