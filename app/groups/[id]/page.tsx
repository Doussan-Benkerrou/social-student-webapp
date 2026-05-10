import { redirect } from "next/navigation"
import GroupDetailClient from "@/components/Groupe/GroupDetailClient"
import { getGroupsDetails} from "@/services/GroupsService"
import { getCategories, getPublicationsByGroupe } from "@/services/PublicationService"
import { getCurrentUser } from "@/services/SessionService"
import { getGroupMembers,getUserStatusInGroup } from "@/services/memberService"

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
    const idGroup = Number(id);

    const [groupResult, membersResult, userStatusResult, publicationsResult, categories] = await Promise.all([
        getGroupsDetails(idGroup),
        getGroupMembers(idGroup),
        getUserStatusInGroup(idGroup),
        getPublicationsByGroupe(idGroup),
        getCategories(),
    ]);

    return (
        <GroupDetailClient
            idGroup={idGroup}
            curUser={curUser}
            groupResult={groupResult}
            membersResult={membersResult}
            userStatusResult={userStatusResult}
            publicationsResult={publicationsResult}
            categories={categories}
        />
    );
}
