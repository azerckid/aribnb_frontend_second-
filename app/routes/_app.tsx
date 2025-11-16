import { Outlet } from "react-router";
import { useDisclosure } from "@chakra-ui/react";
import { AppLayout } from "../components/common/AppLayout";
import { Navigation } from "../components/common/Navigation";
import { LoginModal } from "../components/common/LoginModal";
import { SignUpModal } from "../components/common/SignUpModal";
import { Footer } from "../components/common/Footer";
import { Theme } from "@chakra-ui/react";
import { useState } from "react";

export default function AppRouteLayout() {
    const login = useDisclosure();
    const signup = useDisclosure();
    type Appearance = "light" | "dark";
    const [appearance, setAppearance] = useState<Appearance>("light");
    const toggleAppearance = () =>
        setAppearance((prev) => (prev === "dark" ? "light" : "dark"));

    return (
        <Theme appearance={appearance}>
            <AppLayout
                header=
                {
                    <Navigation
                        onLoginClick={login.onOpen}
                        onSignUpClick={signup.onOpen}
                        appearance={appearance}
                        onToggleAppearance={toggleAppearance} />
                }
                footer=
                {
                    <Footer />
                }
            >
                <Outlet />
                <LoginModal isOpen={login.open} onClose={login.onClose} />
                <SignUpModal isOpen={signup.open} onClose={signup.onClose} />
            </AppLayout>
        </Theme>
    );
}


