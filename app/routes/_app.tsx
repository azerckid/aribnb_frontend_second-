import { Outlet } from "react-router";
import { AppLayout } from "../common/components/AppLayout";
import { Navigation } from "../common/components/Navigation";

export default function AppRouteLayout() {
    return (
        <AppLayout header={<Navigation />}>
            <Outlet />
        </AppLayout>
    );
}


