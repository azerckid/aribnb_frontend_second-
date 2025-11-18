import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Spinner, VStack, Container } from "@chakra-ui/react";
import { toaster } from "~/components/ui/toaster";

export default function GitHubCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    useEffect(() => {
        const handleCallback = async () => {
            if (error) {
                // GitHub에서 에러가 발생한 경우
                toaster.create({
                    title: "GitHub 로그인 실패",
                    description: error === "access_denied"
                        ? "GitHub 로그인이 취소되었습니다."
                        : "알 수 없는 오류가 발생했습니다.",
                    type: "error",
                    duration: 3000,
                });
                navigate("/");
                return;
            }

            if (!code) {
                // 인증 코드가 없는 경우
                toaster.create({
                    title: "인증 코드 없음",
                    description: "GitHub 인증 코드를 받지 못했습니다.",
                    type: "error",
                    duration: 3000,
                });
                navigate("/");
                return;
            }

            // 로딩 토스트 표시
            let loadingToastId: string | undefined;

            try {
                loadingToastId = toaster.create({
                    title: "GitHub 로그인 처리 중",
                    description: "잠시만 기다려주세요...",
                    type: "loading",
                    duration: 10000, // 충분한 시간 확보
                });

                // 백엔드로 인증 코드 전달
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

                // 로그: 받은 코드 확인
                console.log("GitHub callback - Received code:", code ? `${code.substring(0, 10)}...` : "없음");

                // CSRF 토큰 가져오기
                const getCsrfToken = (): string | null => {
                    if (typeof document === "undefined") return null;
                    const name = "csrftoken";
                    if (document.cookie && document.cookie !== "") {
                        const cookies = document.cookie.split(";");
                        for (let i = 0; i < cookies.length; i++) {
                            const cookie = cookies[i].trim();
                            if (cookie.substring(0, name.length + 1) === name + "=") {
                                return decodeURIComponent(cookie.substring(name.length + 1));
                            }
                        }
                    }
                    return null;
                };

                const csrfToken = getCsrfToken();
                const headers: Record<string, string> = {
                    "Content-Type": "application/json",
                };
                if (csrfToken) {
                    headers["X-CSRFToken"] = csrfToken;
                }

                const requestUrl = `${API_BASE_URL}/users/github/callback`;
                console.log("GitHub callback - Sending request to:", requestUrl);
                console.log("GitHub callback - Request body:", { code: code ? `${code.substring(0, 10)}...` : null });

                const response = await fetch(requestUrl, {
                    method: "POST",
                    credentials: "include",
                    headers,
                    body: JSON.stringify({ code }),
                });

                console.log("GitHub callback - Response status:", response.status, response.statusText);

                if (!response.ok) {
                    throw new Error("GitHub 로그인 처리 실패");
                }

                // 로딩 토스트를 성공 토스트로 업데이트
                toaster.update(loadingToastId, {
                    title: "GitHub 로그인 성공",
                    description: "환영합니다!",
                    type: "success",
                    duration: 2000,
                });

                // 페이지 새로고침하여 사용자 상태 업데이트
                window.location.href = "/";
            } catch (error) {
                console.error("GitHub callback error:", error);

                // 로딩 토스트를 에러 토스트로 업데이트
                const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
                if (typeof loadingToastId !== "undefined") {
                    toaster.update(loadingToastId, {
                        title: "GitHub 로그인 실패",
                        description: errorMessage,
                        type: "error",
                        duration: 3000,
                    });
                } else {
                    toaster.create({
                        title: "GitHub 로그인 실패",
                        description: errorMessage,
                        type: "error",
                        duration: 3000,
                    });
                }
                navigate("/");
            }
        };

        handleCallback();
    }, [code, error, navigate]);

    return (
        <Container maxW="md" py={20}>
            <VStack gap={4} align="center">
                <Spinner size="xl" />
            </VStack>
        </Container>
    );
}

