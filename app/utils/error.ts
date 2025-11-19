/**
 * API 에러 메시지를 사용자 친화적인 한국어 메시지로 변환합니다.
 * @param error - Error 객체 또는 에러 메시지 문자열
 * @param defaultMessage - 기본 에러 메시지 (기본값: "알 수 없는 오류가 발생했습니다.")
 * @returns 사용자 친화적인 한국어 에러 메시지
 */
export function parseApiError(
    error: unknown,
    defaultMessage: string = "알 수 없는 오류가 발생했습니다."
): string {
    if (!(error instanceof Error)) {
        return defaultMessage;
    }

    try {
        const errorText = error.message;

        // Invalid credentials 관련
        if (errorText.includes("Invalid credentials") || errorText.includes("자격 인증")) {
            return "아이디 또는 비밀번호가 올바르지 않습니다.";
        }

        // HTTP 상태 코드 기반 에러
        if (errorText.includes("401") || errorText.includes("Unauthorized")) {
            return "인증에 실패했습니다. 아이디와 비밀번호를 확인해주세요.";
        }

        if (errorText.includes("403") || errorText.includes("Forbidden")) {
            return "접근 권한이 없습니다.";
        }

        if (errorText.includes("404") || errorText.includes("Not Found")) {
            return "요청한 페이지를 찾을 수 없습니다.";
        }

        if (errorText.includes("500") || errorText.includes("Internal Server")) {
            return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }

        // 네트워크 에러
        if (errorText.includes("Network") || errorText.includes("Failed to fetch")) {
            return "네트워크 연결을 확인해주세요.";
        }

        // JSON 파싱 시도
        const jsonMatch = errorText.match(/\{.*\}/);
        if (jsonMatch) {
            try {
                const errorJson = JSON.parse(jsonMatch[0]);
                if (errorJson.error === "Invalid credentials.") {
                    return "아이디 또는 비밀번호가 올바르지 않습니다.";
                }
                if (errorJson.detail) {
                    return errorJson.detail;
                }
            } catch {
                // JSON 파싱 실패 시 계속 진행
            }
        }

        // 기본 메시지 반환
        return defaultMessage;
    } catch {
        // 파싱 실패 시 기본 메시지 사용
        return defaultMessage;
    }
}

