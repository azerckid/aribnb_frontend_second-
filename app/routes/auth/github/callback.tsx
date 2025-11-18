import { useEffect, useState, useCallback } from "react";
import { useNavigate, useRevalidator } from "react-router";
import { Spinner, VStack, Container } from "@chakra-ui/react";
import { toaster } from "~/components/ui/toaster";
import { oauthCallback } from "~/utils/api";

import type { Route } from "./+types/callback";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    // GitHub에서 에러가 발생한 경우
    if (error) {
        return {
            error: error === "access_denied"
                ? "GitHub 로그인이 취소되었습니다."
                : "알 수 없는 오류가 발생했습니다.",
        };
    }

    // 인증 코드가 없는 경우
    if (!code) {
        return {
            error: "GitHub 인증 코드를 받지 못했습니다.",
        };
    }

    // 코드가 있으면 컴포넌트에서 처리하도록 전달
    return { code };
}

export default function GitHubCallback({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const [processed, setProcessed] = useState(false);

    // 백엔드로 인증 코드 전달 (클라이언트 사이드에서 실행하여 쿠키 저장 보장)
    const handleOAuth = useCallback(async (code: string) => {
        const loadingToastId = toaster.create({
            title: "GitHub 로그인 처리 중...",
            description: "잠시만 기다려주세요.",
            type: "loading",
            duration: 10000,
        });

        try {
            await oauthCallback("github", code);

            // 성공 시 토스트 업데이트
            toaster.update(loadingToastId, {
                title: "GitHub 로그인 성공",
                description: "환영합니다!",
                type: "success",
                duration: 2000,
            });

            setProcessed(true);

            // 약간의 지연 후 revalidate (쿠키가 설정될 시간을 확보)
            setTimeout(() => {
                revalidator.revalidate();
                navigate("/");
            }, 300);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

            toaster.update(loadingToastId, {
                title: "GitHub 로그인 실패",
                description: errorMessage,
                type: "error",
                duration: 3000,
            });

            setProcessed(true);
            setTimeout(() => {
                navigate("/");
            }, 1000);
        }
    }, [navigate, revalidator]);

    useEffect(() => {
        // 이미 처리된 경우 중복 실행 방지
        if (processed) return;

        // loader에서 검증된 에러 처리
        if (loaderData?.error) {
            toaster.create({
                title: "GitHub 로그인 실패",
                description: loaderData.error,
                type: "error",
                duration: 3000,
            });
            setProcessed(true);
            setTimeout(() => {
                navigate("/");
            }, 1000);
            return;
        }

        // loader에서 검증된 코드 사용
        const code = loaderData?.code;
        if (!code) {
            return;
        }

        // useEffect 내에서 호출 (브라우저에서 실행됨)
        handleOAuth(code);
    }, [loaderData, handleOAuth, navigate, processed]);

    return (
        <Container maxW="md" py={20}>
            <VStack gap={4} align="center">
                <Spinner size="xl" />
            </VStack>
        </Container>
    );
}

