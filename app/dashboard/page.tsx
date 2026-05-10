import { redirect } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import PublicationUserModal from "@/components/Publication/PublicationUserModal"
import SuggestionsPanel from "@/components/Groupe/SuggestionsPanel"
import { getCurrentUser } from "@/services/SessionService"
import { getPublicationsUser, getSuggestionsDashboard } from "@/services/dashboardService"
import { getCategories } from "@/services/PublicationService"

function toPlain<T>(value: T): T {
    return JSON.parse(JSON.stringify(value))
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const curUser = await getCurrentUser()
    if (!curUser.success || !curUser.data?.id_utilisateur) {
        redirect("/auth/login")
    }

    const [publications, categories, suggestions] = await Promise.all([
        getPublicationsUser(),
        getCategories(),
        getSuggestionsDashboard(),
    ]);

    const safeCurUser = {
        success: true,
        data: {
            id_utilisateur: Number(curUser.data.id_utilisateur),
            nom:           curUser.data.nom           ?? "",
            prenom:        curUser.data.prenom         ?? "",
            photo_profile: curUser.data.photo_profile  ?? null,
            filiere:       curUser.data.filiere        ?? null,
            niveau_etude:  curUser.data.niveau_etude   ?? null,
        },
    };

    return (
        <AppLayout curUser={safeCurUser}>
            <div className="flex gap-6 p-6 max-w-6xl mx-auto">
                <div className="flex-1 min-w-0 space-y-4">
                    <PublicationUserModal
                        publicationsResult={toPlain(publications)}
                        curUser={safeCurUser}
                        categories={toPlain(categories)}
                    />
                </div>
                <SuggestionsPanel
                    suggestionGroups={toPlain(suggestions.groups)}
                    suggestionCommunities={toPlain(suggestions.communities)}
                />
            </div>
        </AppLayout>
    );
}