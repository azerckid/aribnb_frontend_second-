import type { IAmenity, ICategory, IPhoto, IRoom, IReview, IUser } from "~/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 쿠키 문자열에서 특정 쿠키 값을 추출합니다.
 * @param cookieString 쿠키 문자열 (예: "csrftoken=abc123; sessionid=xyz")
 * @param name 쿠키 이름
 * @returns 쿠키 값 또는 null
 */
function getCookieFromString(cookieString: string | null, name: string): string | null {
    if (!cookieString) return null;
    const cookies = cookieString.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return null;
}

/**
 * 브라우저 쿠키에서 CSRF 토큰을 가져옵니다.
 * 서버 사이드 렌더링 환경에서는 document가 없으므로 null을 반환합니다.
 * @param cookieString 서버 사이드에서 사용할 쿠키 문자열 (선택)
 * @returns CSRF 토큰 문자열 또는 null (토큰이 없는 경우)
 */
export function getCsrfToken(cookieString?: string | null): string | null {
    // 서버 사이드에서 쿠키 문자열이 제공된 경우
    if (cookieString) {
        return getCookieFromString(cookieString, "csrftoken");
    }

    // 브라우저 환경에서 document.cookie 사용
    if (typeof document !== "undefined") {
        return getCookieFromString(document.cookie, "csrftoken");
    }

    return null;
}

interface ApiGetOptions extends RequestInit {
    cookie?: string;
}

/**
 * 범용 GET 요청을 수행하는 API 클라이언트 함수입니다.
 * CSRF 토큰을 자동으로 포함하고, 쿠키 기반 인증을 지원합니다.
 * @template T 응답 데이터의 타입
 * @param path API 엔드포인트 경로 (예: "/rooms/")
 * @param init 선택적 fetch 옵션 (헤더, 쿠키 등)
 * @returns API 응답 데이터를 파싱한 Promise
 * @throws {Error} API 호출 실패 시 에러 (401/403은 "UNAUTHORIZED" 접두사 포함)
 */
export async function apiGet<T>(path: string, init?: ApiGetOptions): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const csrfToken = getCsrfToken();

    // 헤더 구성
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    // 기존 헤더 병합
    if (init?.headers) {
        if (init.headers instanceof Headers) {
            init.headers.forEach((value, key) => {
                headers[key] = value;
            });
        } else if (Array.isArray(init.headers)) {
            init.headers.forEach(([key, value]) => {
                headers[key] = value;
            });
        } else {
            Object.assign(headers, init.headers);
        }
    }

    // CSRF 토큰 추가
    if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
    }

    // 서버 사이드 렌더링에서 쿠키를 전달하기 위해 Cookie 헤더 추가
    if (init?.cookie) {
        headers["Cookie"] = init.cookie;
    }

    // cookie는 fetch 옵션이 아니므로 제외하고 fetchOptions 구성
    const { cookie, ...fetchOptions } = init || {};

    const res = await fetch(url, {
        ...fetchOptions,
        credentials: "include",
        headers: headers as HeadersInit,
    });

    if (!res.ok) {
        const text = await res.text();
        // 401, 403은 인증되지 않은 상태이므로 정상적인 응답으로 처리
        if (res.status === 401 || res.status === 403) {
            throw new Error(`UNAUTHORIZED: ${text}`);
        }
        throw new Error(`API ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
}

/**
 * 모든 방 목록을 가져옵니다.
 * @returns 방 목록 배열
 * @throws {Error} API 호출 실패 시 에러
 */
export async function getRooms(cookie?: string): Promise<IRoom[]> {
    return apiGet<IRoom[]>("/rooms/", cookie ? { cookie } : undefined);
}

/**
 * 특정 방의 상세 정보를 가져옵니다.
 * @param roomPk 방의 고유 식별자 (숫자 또는 문자열)
 * @param cookie 서버 사이드 렌더링에서 사용할 쿠키 문자열 (선택)
 * @returns 방 상세 정보 객체
 * @throws {Error} API 호출 실패 시 에러
 */
export async function getRoom(roomPk: number | string, cookie?: string): Promise<IRoom> {
    return apiGet<IRoom>(`/rooms/${roomPk}`, cookie ? { cookie } : undefined);
}

/**
 * 특정 방의 리뷰 목록을 가져옵니다.
 * @param roomPk 방의 고유 식별자 (숫자 또는 문자열)
 * @returns 리뷰 목록 배열
 * @throws {Error} API 호출 실패 시 에러
 */
export async function getRoomReviews(roomPk: number | string): Promise<IReview[]> {
    return apiGet<IReview[]>(`/rooms/${roomPk}/reviews`);
}

/**
 * 현재 로그인한 사용자의 정보를 가져옵니다.
 * 서버 사이드 렌더링 환경에서 쿠키를 직접 전달할 수 있습니다.
 * @param cookie 선택적 쿠키 문자열 (서버 사이드 렌더링용)
 * @returns 현재 사용자 정보 객체
 * @throws {Error} API 호출 실패 시 에러 (인증되지 않은 경우 포함)
 */
export async function getMe(cookie?: string): Promise<IUser> {
    return apiGet<IUser>("/users/me", cookie ? { cookie } : undefined);
}

/**
 * 사용자 로그인을 수행합니다.
 * 성공 시 인증 쿠키가 자동으로 저장됩니다.
 * @param username 사용자 이름
 * @param password 비밀번호
 * @returns Promise<void> (성공 시 아무 값도 반환하지 않음)
 * @throws {Error} 로그인 실패 시 에러 (개발 환경에서 상세 로그 출력)
 */
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
        // 개발 환경에서 상세 에러 로깅
        if (import.meta.env.DEV) {
            console.error("Login API error:", {
                status: res.status,
                statusText: res.statusText,
                response: text,
            });
        }
        throw new Error(`Login failed: ${text}`);
    }
}

/**
 * 새로운 사용자 회원가입을 수행합니다.
 * @param name 사용자 실명
 * @param email 이메일 주소
 * @param username 사용자 이름 (로그인 ID)
 * @param password 비밀번호
 * @returns Promise<void> (성공 시 아무 값도 반환하지 않음)
 * @throws {Error} 회원가입 실패 시 에러
 */
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

/**
 * 사용자 로그아웃을 수행합니다.
 * 서버에서 인증 쿠키를 무효화합니다.
 * @returns Promise<void> (성공 시 아무 값도 반환하지 않음)
 * @throws {Error} 로그아웃 실패 시 에러
 */
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

/**
 * OAuth 소셜 로그인 콜백 처리
 * @param provider OAuth 제공자 ('github' | 'kakao')
 * @param code OAuth 인증 코드
 * @throws {Error} API 호출 실패 시 에러
 */
export async function oauthCallback(provider: "github" | "kakao", code: string): Promise<void> {
    const url = `${API_BASE_URL}/users/${provider}/callback`;
    const csrfToken = getCsrfToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
    }

    const res = await fetch(url, {
        method: "POST",
        credentials: "include", // 쿠키 저장을 위해 필수
        headers: headers as HeadersInit,
        body: JSON.stringify({ code }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `${provider} 로그인 처리 실패`);
    }
}

/**
 * 새로운 방을 업로드합니다.
 * @param data 방 정보 객체
 * @param data.name 방 이름
 * @param data.country 국가
 * @param data.city 도시
 * @param data.address 주소
 * @param data.price 가격 (숫자)
 * @param data.rooms 방 개수
 * @param data.toilets 화장실 개수
 * @param data.beds 침대 개수
 * @param data.description 방 설명
 * @param data.pet_friendly 반려동물 허용 여부
 * @param data.kind 방 종류 ("entire_place" | "private_room" | "shared_room")
 * @param data.category 카테고리 ID
 * @param data.amenities 편의시설 ID 배열
 * @param cookie 서버 사이드 렌더링에서 사용할 쿠키 문자열 (선택)
 * @returns 생성된 방 정보 객체
 * @throws {Error} 방 업로드 실패 시 에러
 */
export async function uploadRoom(
    data: {
        name: string;
        country: string;
        city: string;
        address: string;
        price: number;
        rooms: number;
        toilets: number;
        beds: number;
        description: string;
        pet_friendly: boolean;
        kind: string;
        category: number;
        amenities: number[];
    },
    cookie?: string
): Promise<IRoom> {
    const url = `${API_BASE_URL}/rooms/`;
    // 서버 사이드에서는 쿠키 문자열에서 CSRF 토큰 추출
    const csrfToken = getCsrfToken(cookie);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
    }

    // 서버 사이드 렌더링에서 쿠키를 전달하기 위해 Cookie 헤더 추가
    if (cookie) {
        headers["Cookie"] = cookie;
    }

    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: headers as HeadersInit,
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const text = await res.text();
        // 개발 환경에서 상세 에러 로깅
        if (import.meta.env.DEV) {
            console.error("Upload room API error:", {
                status: res.status,
                statusText: res.statusText,
                response: text,
            });
        }
        // 401/403은 인증/권한 에러이므로 특별 처리
        if (res.status === 401 || res.status === 403) {
            throw new Error(`UNAUTHORIZED: ${text}`);
        }
        throw new Error(`Room upload failed: ${text}`);
    }

    return res.json() as Promise<IRoom>;
}

/**
 * 모든 편의시설 목록을 가져옵니다.
 * @param cookie 서버 사이드 렌더링에서 사용할 쿠키 문자열 (선택)
 * @returns 편의시설 목록 배열
 * @throws {Error} API 호출 실패 시 에러
 */
export async function getAmenities(cookie?: string): Promise<IAmenity[]> {
    return apiGet<IAmenity[]>("/rooms/amenities", cookie ? { cookie } : undefined);
}

/**
 * 모든 카테고리 목록을 가져옵니다.
 * @param cookie 서버 사이드 렌더링에서 사용할 쿠키 문자열 (선택)
 * @returns 카테고리 목록 배열
 * @throws {Error} API 호출 실패 시 에러
 */
export async function getCategories(cookie?: string): Promise<ICategory[]> {
    return apiGet<ICategory[]>("/categories", cookie ? { cookie } : undefined);
}

/**
 * 방에 사진을 업로드합니다.
 * @param roomPk 방 ID
 * @param file 업로드할 이미지 파일
 * @param description 사진 설명 (선택)
 * @param cookie 서버 사이드 렌더링에서 사용할 쿠키 문자열 (선택)
 * @returns 업로드된 사진 정보
 * @throws {Error} 사진 업로드 실패 시 에러
 */
export async function uploadRoomPhoto(
    roomPk: number,
    file: File,
    description: string = "",
    cookie?: string
): Promise<IPhoto> {
    const url = `${API_BASE_URL}/rooms/${roomPk}/photos`;
    const csrfToken = getCsrfToken(cookie);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    // FormData를 보낼 때는 Content-Type을 설정하지 않음 (브라우저가 자동으로 boundary 포함하여 설정)
    const headers: Record<string, string> = {};
    if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
    }

    if (cookie) {
        headers["Cookie"] = cookie;
    }

    if (import.meta.env.DEV) {
        console.log("Upload photo request:", {
            url,
            roomPk,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            hasCsrfToken: !!csrfToken,
            hasCookie: !!cookie,
        });
    }

    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: headers as HeadersInit,
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text();
        if (import.meta.env.DEV) {
            console.error("Upload photo API error:", {
                url,
                status: res.status,
                statusText: res.statusText,
                response: text,
                headers: Object.fromEntries(res.headers.entries()),
            });
        }
        if (res.status === 401 || res.status === 403) {
            throw new Error(`UNAUTHORIZED: ${text}`);
        }
        if (res.status === 404) {
            throw new Error(`API endpoint not found: ${url}. Please check if the backend endpoint is configured correctly.`);
        }
        throw new Error(`Photo upload failed (${res.status}): ${text}`);
    }

    return res.json() as Promise<IPhoto>;
}

/**
 * 방의 사진을 삭제합니다.
 * @param photoPk 삭제할 사진 ID
 * @param cookie 서버 사이드 렌더링에서 사용할 쿠키 문자열 (선택)
 * @throws {Error} 사진 삭제 실패 시 에러
 */
export async function deleteRoomPhoto(
    photoPk: string | number,
    cookie?: string
): Promise<void> {
    const url = `${API_BASE_URL}/medias/photos/${photoPk}`;
    const csrfToken = getCsrfToken(cookie);

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
    }

    if (cookie) {
        headers["Cookie"] = cookie;
    }

    if (import.meta.env.DEV) {
        console.log("Delete photo request:", {
            url,
            photoPk,
            hasCsrfToken: !!csrfToken,
            hasCookie: !!cookie,
        });
    }

    const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
        headers: headers as HeadersInit,
    });

    if (!res.ok) {
        const text = await res.text();
        if (import.meta.env.DEV) {
            console.error("Delete photo API error:", {
                url,
                status: res.status,
                statusText: res.statusText,
                response: text,
            });
        }
        if (res.status === 401 || res.status === 403) {
            throw new Error(`UNAUTHORIZED: ${text}`);
        }
        if (res.status === 404) {
            throw new Error(`Photo not found: ${url}`);
        }
        throw new Error(`Photo deletion failed (${res.status}): ${text}`);
    }
}

