import { redirect } from "next/navigation"
import { getCurrentUser } from "@/services/SessionService"
import { getCategories, getFavorisPublications } from "@/services/PublicationService"
import FavoritesClient from "./FavoritesClient"

export const dynamic = "force-dynamic";

export default async function Page() {
    
    const curUser = await getCurrentUser();
    if (!curUser.success) redirect("/auth/login")

    const [favoritesResult, categories] = await Promise.all([
        getFavorisPublications(),
        getCategories(),
    ]);

    return (
        <FavoritesClient
            curUser={curUser}
            initialFavorites={favoritesResult}
            categories={categories}
        />
    );
}