import { redirect } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { getCurrentUser } from "@/services/SessionService";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {

    const curUser = await getCurrentUser();
    if (!curUser.success || !curUser.data?.id_utilisateur) redirect("/auth/login");

    return (
        <AppLayout curUser={curUser}>
            <NotificationsClient currentUserId={curUser.data.id_utilisateur} />
        </AppLayout>
    );
}
