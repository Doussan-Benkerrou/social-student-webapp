"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./SessionService";
import { getUserGroupIds } from "./memberService";
import { getFavorisUser, uploadPostImages } from "./PublicationService";
import { getReactionUser } from "./reactionService";
import { getListErrorResponse, getNestedGroupsPayloadError, normalizePublications } from "@/lib/utils";
import { GroupeType } from "@/lib/types";
import type { pubUserInput, SearchCategory, ResponseType, UserSearchResult, GroupSearchResult } from "@/lib/types";

const PUBLICATION_SELECT = `
    id_publication, contenu, date_publication, est_anonyme, id_utilisateur,
    auteur:utilisateur!fk_publication_utilisateur(id_utilisateur, nom, prenom, photo_profile, filiere, niveau_etude),
    categorie(id_categorie, nom_categorie),
    medias:media(id_media, url_media, type_media),
    reactions:reaction(count),
    commentaires:commentaire(count),
    signalisations:signalisation(id_utilisateur, motif_signale)
`;

async function getBlockedIdsForUser(supabase: any, currentUserId: number): Promise<Set<number>> {
    const { data: blocages } = await supabase
        .from("blocage").select("id_bloqueur, id_bloque")
        .or(`id_bloqueur.eq.${currentUserId},id_bloque.eq.${currentUserId}`);

    const blockedIds = new Set<number>();
    for (const row of blocages ?? []) {
        if (row.id_bloqueur === currentUserId) blockedIds.add(row.id_bloque);
        if (row.id_bloque   === currentUserId) blockedIds.add(row.id_bloqueur);
    }
    return blockedIds;
}

async function buildNormalizedPublications(
    publications: any[],
    currentUserId: number
): Promise<any[]> {
    const pubIds = publications.map((p) => p.id_publication);
    const [reactionsResult, favorisResult] = await Promise.all([
        getReactionUser(pubIds),
        getFavorisUser(pubIds),
    ]);
    if (!reactionsResult.success || !favorisResult.success) return [];

    const pubsReagir  = new Set<number>((reactionsResult.data ?? []).map((p: any) => p.id_publication));
    const pubsFavoris = new Set<number>((favorisResult.data ?? []).map((p: any) => p.id_publication));

    return publications.map((pub) => normalizePublications(pub, pubsReagir, pubsFavoris, currentUserId));
}


export async function createPublicationUser(pubUserInputData: pubUserInput): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser  = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { data: pub, error } = await supabase
        .from("publication")
        .insert({
            contenu:        pubUserInputData.contenu,
            id_utilisateur: curUser.data.id_utilisateur,
            id_categorie:   Number(pubUserInputData.categorieType),
            est_anonyme:    pubUserInputData.isAnonyme,
        })
        .is("id_groupe", null).select().single();

    if (error) return { success: false, message: "Erreur lors de la création de la publication." };

    if (pubUserInputData.pictures?.length) {
        const uploadResult = await uploadPostImages(pubUserInputData.pictures, pub.id_publication);
        if (!uploadResult.success) return uploadResult;
    }

    return { success: true, data: pub };
}

export async function getPublicationsUser(page: number = 1, limit: number = 20): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser  = await getCurrentUser();
    if (!curUser.success) return getListErrorResponse(curUser.message ?? "");

    const currentUserId = curUser.data.id_utilisateur;
    const oneWeekAgo    = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    const [blockedIds, pubResult] = await Promise.all([
        getBlockedIdsForUser(supabase, currentUserId),
        supabase
            .from("publication").select(PUBLICATION_SELECT)
            .order("date_publication", { ascending: false })
            .is("id_groupe", null)
            .gte("date_publication", oneWeekAgo.toISOString())
            .range(from, to),
    ]);

    if (pubResult.error) return getListErrorResponse("Impossible de charger les publications.");

    const publications = blockedIds.size > 0
        ? (pubResult.data ?? []).filter((p: any) => !blockedIds.has(p.id_utilisateur))
        : (pubResult.data ?? []);

    const normalized = await buildNormalizedPublications(publications, currentUserId);
    return { success: true, data: normalized };
}

export async function editPublicationUser(id_publication: number, pubInputUser: pubUserInput): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser  = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { error } = await supabase
        .from("publication")
        .update({ contenu: pubInputUser.contenu, id_categorie: Number(pubInputUser.categorieType), est_anonyme: pubInputUser.isAnonyme })
        .eq("id_publication", id_publication).eq("id_utilisateur", curUser.data.id_utilisateur);

    if (error) return { success: false, message: "Erreur lors de la modification de la publication." };

    if (pubInputUser.pictures?.length) {
        const uploadResult = await uploadPostImages(pubInputUser.pictures, id_publication);
        if (!uploadResult.success) return uploadResult;
    }

    return { success: true };
}

export async function getPublicationsUserById(id_utilisateur: number, page: number = 1, limit: number = 20): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser  = await getCurrentUser();
    if (!curUser.success) return getListErrorResponse(curUser.message ?? "");

    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    const { data: publications, error } = await supabase
        .from("publication").select(PUBLICATION_SELECT)
        .order("date_publication", { ascending: false })
        .is("id_groupe", null).eq("id_utilisateur", id_utilisateur).range(from, to);

    if (error) return getListErrorResponse("Impossible de charger les publications.");

    const normalized = await buildNormalizedPublications(publications ?? [], curUser.data.id_utilisateur);
    return { success: true, data: normalized };
}


export async function searchDashboard(query: string, category: SearchCategory): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser  = await getCurrentUser();
    if (!curUser.success) return getListErrorResponse(curUser.message ?? "");
    if (!query.trim()) return { success: true, data: [] };

    if (category === "Personne") {
        const currentUserId = curUser.data.id_utilisateur;
        const [usersResponse, blocagesResponse] = await Promise.all([
            supabase.from("utilisateur")
                .select("id_utilisateur, nom, prenom, filiere, photo_profile")
                .or(`nom.ilike.%${query}%,prenom.ilike.%${query}%,filiere.ilike.%${query}%`)
                .neq("id_utilisateur", currentUserId).limit(10),
            supabase.from("blocage").select("id_bloqueur, id_bloque")
                .or(`id_bloqueur.eq.${currentUserId},id_bloque.eq.${currentUserId}`),
        ]);

        if (usersResponse.error) return getListErrorResponse("La recherche d'utilisateurs a échoué.");

        const blockedIds = new Set<number>();
        for (const row of blocagesResponse.data ?? []) {
            if (row.id_bloqueur === currentUserId) blockedIds.add(row.id_bloque);
            if (row.id_bloque   === currentUserId) blockedIds.add(row.id_bloqueur);
        }

        const filtered: UserSearchResult[] = (usersResponse.data ?? [])
            .filter((u: any) => !blockedIds.has(u.id_utilisateur))
            .slice(0, 5)
            .map((u: any) => ({
                type: "user" as const,
                id:   u.id_utilisateur,
                nom:  u.nom,
                prenom: u.prenom,
                filiere: u.filiere ?? null,
                photo_profile: u.photo_profile ?? null,
            }));

        return { success: true, data: filtered };
    }

    const typeGroupe = category === "Groupe" ? GroupeType.PUBLIC : GroupeType.DISCUSSION;
    const { data, error } = await supabase
        .from("groupe")
        .select("id_groupe, nom_groupe, description, photo_groupe, type_grp, membre(id_utilisateur, date_quitte)")
        .eq("type_grp", typeGroupe).ilike("nom_groupe", `%${query}%`).limit(5);

    if (error) return getListErrorResponse("La recherche de groupes a échoué.");

    const results: GroupSearchResult[] = (data ?? []).map((g: any) => ({
        type: (category === "Groupe" ? "group" : "community") as "group" | "community",
        id:   g.id_groupe,
        nom:  g.nom_groupe,
        description: g.description ?? null,
        photo: g.photo_groupe ?? null,
        membres_count: (g.membre ?? []).filter((m: any) => m.date_quitte === null).length,
    }));

    return { success: true, data: results };
}


async function getExclusionData(userId: number) {
    const supabase = await createClient();
    const [memberIdsResult, pendingJoinResult, acceptedJoinResult] = await Promise.all([
        getUserGroupIds(),
        supabase.from("invitation").select("id_groupe").eq("id_emetteur", userId).eq("status_invitation", "en_attente"),
        supabase.from("invitation").select("id_groupe").eq("id_emetteur", userId).eq("status_invitation", "accepter"),
    ]);
    return { memberIdsResult, pendingJoinResult, acceptedJoinResult };
}

export async function getSuggestionsDashboard(): Promise<{ groups: ResponseType; communities: ResponseType }> {
    const supabase   = await createClient();
    const userResult = await getCurrentUser();

    if (!userResult.success) {
        const err = getNestedGroupsPayloadError(userResult.message ?? "");
        return { groups: err, communities: err };
    }

    const userId = userResult.data.id_utilisateur;
    const { memberIdsResult, pendingJoinResult, acceptedJoinResult } = await getExclusionData(userId);

    if (!memberIdsResult.success) {
        const err = getNestedGroupsPayloadError(memberIdsResult.message ?? "");
        return { groups: err, communities: err };
    }

    const joinedGroupIds:   number[] = memberIdsResult.data ?? [];
    const pendingGroupIds:  number[] = (pendingJoinResult.data  ?? []).map((i: any) => i.id_groupe);
    const acceptedGroupIds: number[] = (acceptedJoinResult.data ?? []).map((i: any) => i.id_groupe);
    const allExcludedIds             = [...new Set([...joinedGroupIds, ...acceptedGroupIds])];
    const exclusionFilter            = allExcludedIds.length > 0 ? `(${allExcludedIds.join(",")})` : "(0)";

    const selectQuery = `id_groupe, nom_groupe, description, type_grp, photo_groupe, membre(id_utilisateur, date_quitte)`;

    const [groupsResult, communitiesResult] = await Promise.all([
        supabase.from("groupe").select(selectQuery).eq("type_grp", GroupeType.PUBLIC).not("id_groupe", "in", exclusionFilter).limit(3),
        supabase.from("groupe").select(selectQuery).eq("type_grp", GroupeType.DISCUSSION).not("id_groupe", "in", exclusionFilter).limit(3),
    ]);

    const toResponse = (result: typeof groupsResult): ResponseType => {
        if (result.error) return getNestedGroupsPayloadError("Impossible de charger les suggestions.");
        const groups = (result.data ?? []).map((group: any) => ({
            ...group,
            membres_count: (group.membre ?? []).filter((m: any) => m.date_quitte === null).length,
        }));
        return { success: true, data: { groups, pendingGroupIds } };
    };

    return { groups: toResponse(groupsResult), communities: toResponse(communitiesResult) };
}