import { Outlet } from "react-router";
import { AppLayout } from "../components/common/AppLayout";
import { Navigation } from "../components/common/Navigation";
import { LoginModal } from "../components/common/LoginModal";
import { SignUpModal } from "../components/common/SignUpModal";
import { useDisclosure } from "@chakra-ui/react";

export default function AppRouteLayout() {
    const login = useDisclosure();
    const signup = useDisclosure();
    return (
        <AppLayout header={<Navigation onLoginClick={login.onOpen} onSignUpClick={signup.onOpen} />}>
            <Outlet />
            <LoginModal isOpen={login.open} onClose={login.onClose} />
            <SignUpModal isOpen={signup.open} onClose={signup.onClose} />
        </AppLayout>
    );
}


