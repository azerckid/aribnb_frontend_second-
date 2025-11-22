import { useState } from "react";
import { Outlet, useLoaderData, useRevalidator } from "react-router";

import type { Route } from "./+types/_app";

import { Theme } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { getMe, logout } from "~/utils/api";
import { toaster } from "~/components/ui/toaster";
import { Footer } from "../components/common/Footer";
import { AppLayout } from "../components/common/AppLayout";
import { Navigation } from "../components/common/Navigation";
import { LoginModal } from "../components/common/LoginModal";
import { SignUpModal } from "../components/common/SignUpModal";

type Appearance = "light" | "dark";

export async function clientLoader() {
    try {
        const user = await getMe();
        return { user, isLoggedIn: true };
    } catch (error) {
        return { user: null, isLoggedIn: false };
    }
}

export default function AppRouteLayout({ loaderData }: Route.ComponentProps) {
    const { user, isLoggedIn } = loaderData;
    const revalidator = useRevalidator();
    const login = useDisclosure();
    const signup = useDisclosure();

    const [appearance, setAppearance] = useState<Appearance>("light");
    const toggleAppearance = () =>
        setAppearance((prev) => (prev === "dark" ? "light" : "dark"));

    const onLogoutSuccess = async () => {
        const loadingToastId = toaster.create({
            title: "Logging out...",
            description: "please wait...",
            type: "loading",
            duration: 10000,
        });

        try {
            await logout();
            toaster.update(loadingToastId, {
                title: "Logged out successfully",
                description: "see you soon!",
                type: "success",
                duration: 2000,
            });
            // 로그아웃 후 데이터 재검증
            revalidator.revalidate();
        } catch (error) {
            console.error("Logout failed:", error);
            toaster.update(loadingToastId, {
                title: "로그아웃 실패",
                description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
                type: "error",
                duration: 3000,
            });
        }
    }

    return (
        <Theme appearance={appearance}>
            <AppLayout
                header={
                    <Navigation
                        user={user}
                        isLoggedIn={isLoggedIn}
                        onLoginClick={login.onOpen}
                        onSignUpClick={signup.onOpen}
                        onLogoutSuccess={onLogoutSuccess}
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
                        // 로그인 성공 후 데이터 재검증
                        revalidator.revalidate();
                    }} />
                <SignUpModal
                    isOpen={signup.open}
                    onClose={signup.onClose}
                    onSignUpSuccess={() => {
                        // 회원가입 성공 후 데이터 재검증
                        revalidator.revalidate();
                    }} />
            </AppLayout>
        </Theme>
    );
}