import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Spinner, VStack, Text, Container } from "@chakra-ui/react";
import { toaster } from "~/components/ui/toaster";

export default function KakaoCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    useEffect(() => {
        const handleCallback = async () => {
            if (error) {
                // 카카오에서 에러가 발생한 경우
                toaster.create({
                    title: "카카오 로그인 실패",
                    description: error === "access_denied"
                        ? "카카오 로그인이 취소되었습니다."
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
                    description: "카카오 인증 코드를 받지 못했습니다.",
                    type: "error",
                    duration: 3000,
                });
                navigate("/");
                return;
            }

            try {
                // 백엔드로 인증 코드 전달
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
                const response = await fetch(`${API_BASE_URL}/users/kakao/callback`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code }),
                });

                if (!response.ok) {
                    throw new Error("카카오 로그인 처리 실패");
                }

                // 성공 시 홈으로 리다이렉트
                toaster.create({
                    title: "카카오 로그인 성공",
                    description: "환영합니다!",
                    type: "success",
                    duration: 2000,
                });

                // 페이지 새로고침하여 사용자 상태 업데이트
                window.location.href = "/";
            } catch (error) {
                console.error("Kakao callback error:", error);
                toaster.create({
                    title: "카카오 로그인 실패",
                    description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
                    type: "error",
                    duration: 3000,
                });
                navigate("/");
            }
        };

        handleCallback();
    }, [code, error, navigate]);

    return (
        <Container maxW="md" py={20}>
            <VStack gap={4} align="center">
                <Spinner size="xl" />
                <Text>카카오 로그인 처리 중...</Text>
            </VStack>
        </Container>
    );
}

