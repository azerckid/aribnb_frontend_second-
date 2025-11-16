import { Outlet } from "react-router";
import { AppLayout } from "../common/AppLayout";
import { Navigation } from "../common/Navigation";

export default function AppRouteLayout() {
    return (
        <AppLayout header={<Navigation />}>
            <Outlet />
        </AppLayout>
    );
}


