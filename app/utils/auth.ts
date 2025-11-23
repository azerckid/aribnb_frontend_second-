import { redirect } from "react-router";
import { getMe } from "./api";
import type { IUser } from "~/types";

/**
 * 요청에서 사용자 정보를 가져옵니다.
 * @param request - Request 객체
 * @returns 사용자 정보 또는 null
 */
export async function getUserFromRequest(request: Request): Promise<IUser | null> {
    try {
        // 브라우저 환경에서는 쿠키를 직접 추출할 필요 없음 (자동 전송)
        // 서버 사이드 렌더링 시에만 request 헤더에서 쿠키 추출
        const isServer = typeof document === "undefined";
        const cookie = isServer ? request.headers.get("Cookie") : undefined;

        const user = await getMe(cookie || undefined);
        return user;
    } catch (error) {
        // 401/403은 정상적인 상황(로그인하지 않은 사용자)
        return null;
    }
}

/**
 * 인증이 필요한 페이지를 보호합니다.
 * 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트합니다.
 * @param request - Request 객체
 * @param redirectTo - 리다이렉트할 경로 (기본값: "/")
 * @returns 사용자 정보
 * @throws redirect - 로그인하지 않은 경우 리다이렉트
 */
export async function requireAuth(
    request: Request,
    redirectTo: string = "/"
): Promise<IUser> {
    const user = await getUserFromRequest(request);

    if (!user) {
        // 현재 URL을 쿼리 파라미터로 전달하여 로그인 후 돌아올 수 있도록
        const url = new URL(request.url);
        const redirectUrl = url.pathname + url.search;
        throw redirect(`${redirectTo}?redirect=${encodeURIComponent(redirectUrl)}`);
    }

    return user;
}

/**
 * 호스트 권한이 필요한 페이지를 보호합니다.
 * 로그인하지 않았거나 호스트가 아닌 사용자는 홈으로 리다이렉트합니다.
 * @param request - Request 객체
 * @param redirectTo - 리다이렉트할 경로 (기본값: "/")
 * @returns 호스트 사용자 정보
 * @throws redirect - 권한이 없는 경우 리다이렉트
 */
export async function requireHost(
    request: Request,
    redirectTo: string = "/"
): Promise<IUser> {
    const user = await requireAuth(request, redirectTo);

    if (!user.is_host) {
        throw redirect(`${redirectTo}?error=host_only`);
    }

    return user;
}

