import { redirect } from "next/navigation"
import PublicationSharedClient from "@/components/Publication/PublicationSharedClient"
import { getCurrentUser } from "@/services/SessionService"
import { getCategories, getPublicationById } from "@/services/PublicationService"

interface Props {
    params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function Page({ params }: Props) {


    const curUser = await getCurrentUser();
    if (!curUser.success) {
        redirect("/auth/login");
    }

    const { id } = await params;
    const pubId = Number(id);

    const [publicationResult, categories] = await Promise.all([
        getPublicationById(pubId),
        getCategories(),
    ]);

    return (
        <PublicationSharedClient
            pubId={pubId}
            curUser={curUser}
            publicationResult={publicationResult}
            categories={categories}
        />
    );
}
