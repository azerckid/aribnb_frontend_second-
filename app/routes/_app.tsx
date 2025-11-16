import { Outlet, useOutletContext } from "react-router";
import { useDisclosure } from "@chakra-ui/react";
import { AppLayout } from "../components/common/AppLayout";
import { Navigation } from "../components/common/Navigation";
import { LoginModal } from "../components/common/LoginModal";
import { SignUpModal } from "../components/common/SignUpModal";
import { Footer } from "../components/common/Footer";

export default function AppRouteLayout() {
    const login = useDisclosure();
    const signup = useDisclosure();
    const { appearance, toggleAppearance } = useOutletContext<{ appearance: "light" | "dark"; toggleAppearance: () => void }>();

    return (
        <AppLayout
            header={<Navigation onLoginClick={login.onOpen} onSignUpClick={signup.onOpen} appearance={appearance} onToggleAppearance={toggleAppearance} />}
            footer={<Footer />}
        >
            <Outlet />
            <LoginModal isOpen={login.open} onClose={login.onClose} />
            <SignUpModal isOpen={signup.open} onClose={signup.onClose} />
        </AppLayout>
    );
}


