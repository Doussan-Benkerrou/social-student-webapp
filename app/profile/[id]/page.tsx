import { redirect } from "next/navigation"
import { getCurrentUser } from "@/services/SessionService"
import { getProfile, getProfileById } from "@/services/ProfileService"
import { getPublicationsUserById } from "@/services/dashboardService"
import ProfileDetailClient from "@/components/profile/ProfileDetailClient"
import { getCategories } from "@/services/PublicationService"

interface Props {
    params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function Page({ params }: Props) {


    const curUser = await getCurrentUser()
    if (!curUser.success) redirect("/auth/login")

    const { id } = await params
    const userId = Number(id)

    if (Number.isNaN(userId)) {
        redirect("/dashboard")
    }

    const isCurrentUser = Number(curUser.data?.id_utilisateur) === userId;

    const profile = isCurrentUser
        ? await getProfile()
        : await getProfileById(userId);

    const publications = await getPublicationsUserById(userId);
    const categories = await getCategories();


    return (
        <ProfileDetailClient
            userId={userId}
            curUser={curUser}
            
        />
    );
}
