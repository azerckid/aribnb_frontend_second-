import { Outlet, useRevalidator } from "react-router";
import { useDisclosure } from "@chakra-ui/react";
import { AppLayout } from "../components/common/AppLayout";
import { Navigation } from "../components/common/Navigation";
import { LoginModal } from "../components/common/LoginModal";
import { SignUpModal } from "../components/common/SignUpModal";
import { Footer } from "../components/common/Footer";
import { Theme } from "@chakra-ui/react";
import { useState } from "react";
import type { Route } from "./+types/_app";
import { getMe } from "~/utils/api";

export async function loader({ request }: Route.LoaderArgs) {
    try {
        // request에서 쿠키를 가져와서 API 호출에 전달
        const cookie = request.headers.get("Cookie");
        const user = await getMe(cookie || undefined);
        console.log("Loader: User loaded", user);
        return { user, isLoggedIn: true };
    } catch (error) {
        console.log("Loader: User not logged in", error instanceof Error ? error.message : error);
        return { user: null, isLoggedIn: false };
    }
}

export default function AppRouteLayout({ loaderData }: Route.ComponentProps) {
    const login = useDisclosure();
    const signup = useDisclosure();
    const revalidator = useRevalidator();
    type Appearance = "light" | "dark";
    const [appearance, setAppearance] = useState<Appearance>("light");
    const toggleAppearance = () =>
        setAppearance((prev) => (prev === "dark" ? "light" : "dark"));

    return (
        <Theme appearance={appearance}>
            <AppLayout
                header={
                    <Navigation
                        user={loaderData.user}
                        isLoggedIn={loaderData.isLoggedIn}
                        onLoginClick={login.onOpen}
                        onSignUpClick={signup.onOpen}
                        onLogoutSuccess={async () => {
                            const { logout } = await import("~/utils/api");
                            const { toaster } = await import("~/components/ui/toaster");

                            // 로딩 토스트 표시
                            const loadingToastId = toaster.create({
                                title: "로그아웃 중...",
                                description: "잠시만 기다려주세요.",
                                type: "loading",
                                duration: 10000, // 충분한 시간 확보
                            });

                            try {
                                await logout();

                                // 로딩 토스트를 성공 토스트로 업데이트
                                toaster.update(loadingToastId, {
                                    title: "Logged out successfully",
                                    description: "see you soon!",
                                    type: "success",
                                    duration: 2000,
                                });

                                // 약간의 지연을 두고 revalidate (쿠키가 삭제될 시간을 줌)
                                setTimeout(() => {
                                    revalidator.revalidate();
                                }, 200);
                            } catch (error) {
                                console.error("Logout failed:", error);

                                // 로딩 토스트를 에러 토스트로 업데이트
                                toaster.update(loadingToastId, {
                                    title: "로그아웃 실패",
                                    description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
                                    type: "error",
                                    duration: 3000,
                                });
                            }
                        }}
                        appearance={appearance}
                        onToggleAppearance={toggleAppearance} />
                }
                footer={
                    <Footer />
                }
            >
                <Outlet />
                <LoginModal
                    isOpen={login.open}
                    onClose={login.onClose}
                    onLoginSuccess={() => {
                        console.log("Revalidating after login...");
                        // 약간의 지연을 두고 revalidate (쿠키가 설정될 시간을 줌)
                        setTimeout(() => {
                            revalidator.revalidate();
                        }, 200);
                    }} />
                <SignUpModal
                    isOpen={signup.open}
                    onClose={signup.onClose}
                    onSignUpSuccess={() => {
                        console.log("Revalidating after signup...");
                        setTimeout(() => {
                            revalidator.revalidate();
                        }, 200);
                    }} />
            </AppLayout>
        </Theme>
    );
}


