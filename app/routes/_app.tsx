import { Outlet } from "react-router";
import { AppLayout } from "../components/AppLayout";

export default function AppRouteLayout() {
    return (
        <AppLayout>
            <Outlet />
        </AppLayout>
    );
}


