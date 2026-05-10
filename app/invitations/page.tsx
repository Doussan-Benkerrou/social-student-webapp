import { redirect } from "next/navigation"
import { getCurrentUser } from "@/services/SessionService"
import { getInvitations } from "@/services/invitationService"
import InvitationsClient from "./InvitationsClient"

export const dynamic = "force-dynamic";

export default async function Page() {

    const curUser = await getCurrentUser();
    if (!curUser.success) redirect("/auth/login");

    const invitationsResult = await getInvitations();

    return (
        <InvitationsClient
            curUser={curUser}
            initialInvitations={invitationsResult}
        />
    );
}