import type { IRoom, IReview, IUser } from "~/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// CSRF 토큰 가져오기
function getCsrfToken(): string | null {
    // 서버 사이드 렌더링에서는 document가 없음
    if (typeof document === "undefined") {
        return null;
    }
    const name = "csrftoken";
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


export async function apiGet<T>(path: string, init?: RequestInit & { cookie?: string }): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const csrfToken = getCsrfToken();
    const headers: Record<string, string> = { "Content-Type": "application/json", ...(init?.headers as Record<string, string> || {}) };
    if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
    }
    
    // 서버 사이드 렌더링에서 쿠키를 전달하기 위해 Cookie 헤더 추가
    if (init?.cookie) {
        headers["Cookie"] = init.cookie;
    }
    
    const fetchOptions: RequestInit = {
        credentials: "include",
        headers: headers as HeadersInit,
        ...init,
    };
    // cookie는 fetch 옵션이 아니므로 제거
    delete (fetchOptions as any).cookie;
    
    const res = await fetch(url, fetchOptions);
    if (!res.ok) {
        const text = await res.text();
        // 401은 인증되지 않은 상태이므로 정상적인 응답으로 처리
        if (res.status === 401) {
            throw new Error(`UNAUTHORIZED: ${text}`);
        }
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

export async function getRoomReviews(roomPk: number | string): Promise<IReview[]> {
    return apiGet<IReview[]>(`/rooms/${roomPk}/reviews`);
}

export async function getMe(cookie?: string): Promise<IUser> {
    return apiGet<IUser>("/users/me", cookie ? { cookie } : undefined);
}

export async function login(username: string, password: string): Promise<void> {
    const url = `${API_BASE_URL}/users/log-in`;
    const csrfToken = getCsrfToken();
    
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
    }
    
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: headers as HeadersInit,
        body: JSON.stringify({ username, password }),
    });
    
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Login failed: ${text}`);
    }
}

export async function signUp(
    name: string,
    email: string,
    username: string,
    password: string
): Promise<void> {
    const url = `${API_BASE_URL}/users/`;
    const csrfToken = getCsrfToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
    }
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: headers as HeadersInit,
        body: JSON.stringify({ name, email, username, password }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Sign up failed: ${text}`);
    }
}

export async function logout(): Promise<void> {
    const url = `${API_BASE_URL}/users/log-out`;
    const csrfToken = getCsrfToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
    }
    
    const res = await fetch(url, {
        method: "POST",
        credentials: "include", // 쿠키를 포함하여 전송
        headers: headers as HeadersInit,
    });
    
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Logout failed: ${text}`);
    }
}

