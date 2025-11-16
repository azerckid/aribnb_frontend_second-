import { Outlet } from "react-router";
import { AppLayout } from "../components/common/AppLayout";
import { Navigation } from "../components/common/Navigation";
import { LoginModal } from "../components/common/LoginModal";
import { useDisclosure } from "@chakra-ui/react";

export default function AppRouteLayout() {
  const disclosure = useDisclosure();
  return (
    <AppLayout header={<Navigation onLoginClick={disclosure.onOpen} />}>
      <Outlet />
      <LoginModal isOpen={disclosure.open} onClose={disclosure.onClose} />
    </AppLayout>
  );
}


