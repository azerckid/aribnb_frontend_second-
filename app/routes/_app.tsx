import { useState, useEffect } from "react";
import { Outlet } from "react-router";

import type { Route } from "./+types/_app";

import { Theme } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { getMe, logout } from "~/utils/api";
import type { IUser } from "~/types";
import { toaster } from "~/components/ui/toaster";
import { Footer } from "../components/common/Footer";
import { AppLayout } from "../components/common/AppLayout";
import { Navigation } from "../components/common/Navigation";
import { LoginModal } from "../components/common/LoginModal";
import { SignUpModal } from "../components/common/SignUpModal";

type Appearance = "light" | "dark";

export default function AppRouteLayout({ }: Route.ComponentProps) {
    const login = useDisclosure();
    const signup = useDisclosure();
    const [user, setUser] = useState<IUser | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [appearance, setAppearance] = useState<Appearance>("light");
    const toggleAppearance = () =>
        setAppearance((prev) => (prev === "dark" ? "light" : "dark"));

    // 클라이언트 사이드에서 사용자 정보 가져오기
    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await getMe();
                setUser(currentUser);
                setIsLoggedIn(true);
            } catch (error) {
                // 401/403은 정상적인 상황 (로그인하지 않은 사용자)
                setUser(null);
                setIsLoggedIn(false);
            }
        };

        checkUser();
    }, []);

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
            // 로그아웃 후 사용자 정보 초기화
            setUser(null);
            setIsLoggedIn(false);
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
                    onLoginSuccess={async () => {
                        // 약간의 지연을 두고 사용자 정보 확인 (쿠키가 설정될 시간을 줌)
                        setTimeout(async () => {
                            try {
                                const currentUser = await getMe();
                                setUser(currentUser);
                                setIsLoggedIn(true);
                            } catch (error) {
                                setUser(null);
                                setIsLoggedIn(false);
                            }
                        }, 200);
                    }} />
                <SignUpModal
                    isOpen={signup.open}
                    onClose={signup.onClose}
                    onSignUpSuccess={async () => {
                        // 약간의 지연을 두고 사용자 정보 확인 (쿠키가 설정될 시간을 줌)
                        setTimeout(async () => {
                            try {
                                const currentUser = await getMe();
                                setUser(currentUser);
                                setIsLoggedIn(true);
                            } catch (error) {
                                setUser(null);
                                setIsLoggedIn(false);
                            }
                        }, 200);
                    }} />
            </AppLayout>
        </Theme>
    );
}


