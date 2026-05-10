import { redirect } from "next/navigation"
import GroupClient from "./GroupClient"
import { getActiveGroups, getSuggestionGroups } from "@/services/GroupsService"
import { getCurrentUser } from "@/services/SessionService"

export const dynamic = "force-dynamic";

export default async function Page() {

    const curUser = await getCurrentUser();
    if (!curUser.success) {
        redirect("/auth/login");
    }

    const [myGroupsResult, suggestionsResult] = await Promise.all([
        getActiveGroups(),
        getSuggestionGroups(),
    ]);

    return (
        <GroupClient
            curUser={curUser}
            myGroupsResult={myGroupsResult}
            suggestionsResult={suggestionsResult}
        />
    );
}
