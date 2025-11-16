import { Outlet } from "react-router";
import { AppLayout } from "../components/AppLayout";
import { Navigation } from "../components/Navigation";

export default function AppRouteLayout() {
    return (
    <AppLayout header={<Navigation />}>
            <Outlet />
        </AppLayout>
    );
}


