"use server"


import { getCurrentUser } from "./SessionService";
import { joinGroupAsAdmin } from "./memberService";
import { createClient } from "@/lib/supabase/server";
import { GroupeInput, GroupeType, ResponseType } from "@/lib/types";
import { getListErrorResponse, getNestedGroupsPayloadError } from "@/lib/utils";
import { getUserGroupIds } from "./memberService";



export async function uploadGroupImage(file: File | null): Promise<ResponseType> {
    if (!file) return { success: false, message: "Aucun fichier image sélectionné." };
    const supabase = await createClient();
    const ext = file.name.split(".").pop();
    const fileName = `group_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("groupes").upload(fileName, file);
    if (error) return { success: false, message: "Échec de l'envoi de l'image. Veuillez réessayer avec un autre fichier." };
    const { data } = supabase.storage.from("groupes").getPublicUrl(fileName);
    return { success: true, data: data.publicUrl };
}

export async function createGroupPublication(input: GroupeInput, photoFile: File | null): Promise<ResponseType> {
    const supabase = await createClient();
    const [userResult, imageResult] = await Promise.all(
        [getCurrentUser(), uploadGroupImage(photoFile)]
    );
    if (!userResult.success) return userResult;

    const imageUrl = imageResult.success ? imageResult.data : null;

    const { data: newGroup, error: groupError } = await supabase
        .from("groupe")
        .insert(
            { nom_groupe: input.nameGroup, 
                description: input.description, 
                type_grp: GroupeType.PUBLIC, 
                photo_groupe: imageUrl, 
                id_createur: userResult.data.id_utilisateur }
            )
        .select("id_groupe, nom_groupe, description, photo_groupe, type_grp, id_createur")
        .single();
    if (groupError || !newGroup) 
        return { success: false, message: "Impossible de créer le groupe. Merci de réessayer." };

    const memberError  = await joinGroupAsAdmin(newGroup.id_groupe,userResult.data?.id_utilisateur)
    if (!memberError.success) 
        return { success: false, message: "Group was created, but you could not be added as admin. Please contact support." };

    return { success: true, data: newGroup };
}

export async function getActiveGroups(): Promise<ResponseType> {
    const supabase = await createClient();
    const userResult = await getCurrentUser();

    if (!userResult.success) 
        return getListErrorResponse(userResult.message ?? "Impossible de charger les détails du groupe.");
    const { data: memberships, error } = await supabase
        .from("membre")
        .select("role, groupe(id_groupe, nom_groupe, description, type_grp, photo_groupe, membre(count))")
        .eq("id_utilisateur", userResult.data.id_utilisateur)
        .is("date_quitte", null)
        .is("groupe.membre.date_quitte", null);
    if (error) return getListErrorResponse("Impossible de charger vos groupes. Veuillez rafraîchir la page.");
    return { success: true, data: memberships };
}



export async function getSuggestionGroups(): Promise<ResponseType> {
    const supabase = await createClient();
    const userResult = await getCurrentUser();

    if (!userResult.success) 
        return getNestedGroupsPayloadError(userResult.message ?? "Impossible de charger les suggestions de groupes.");
    
    const userId = userResult.data.id_utilisateur;
    const [memberIdsResult, pendingJoinResult, acceptedJoinResult] = await Promise.all([
        getUserGroupIds(),
        supabase.from("invitation").select("id_groupe").eq("id_emetteur", userId).eq("status_invitation", "en_attente"),
        supabase.from("invitation").select("id_groupe").eq("id_emetteur", userId).eq("status_invitation", "accepter"),
    ]);

    if (!memberIdsResult.success) 
        return getNestedGroupsPayloadError(memberIdsResult.message ?? "Impossible de charger les suggestions de groupes.");

    const joinedGroupIds: number[] = memberIdsResult.data ?? [];
    const pendingGroupIds: number[] = (pendingJoinResult.data ?? []).map((i: any) => i.id_groupe);
    const allExcludedIds = [...new Set([...joinedGroupIds])];

    const exclusionFilter = allExcludedIds.length > 0 ? `(${allExcludedIds.join(",")})` : "(0)";

    const { data: suggestions, error } = await supabase
        .from("groupe")
        .select(`id_groupe, nom_groupe, description, type_grp, photo_groupe, membre(id_utilisateur, date_quitte)`)
        .eq("type_grp", GroupeType.PUBLIC)
        .not("id_groupe", "in", exclusionFilter)
        .limit(10);
    if (error) 
        return getNestedGroupsPayloadError("Impossible de charger les suggestions de groupes. Veuillez rafraîchir la page.");

    const groups = (suggestions ?? []).map((group: any) => (
        { ...group, membres_count: (group.membre ?? []).filter((m: any) => m.date_quitte === null).length 

        }
    ));
    return { success: true, data: { groups, pendingGroupIds } };
}


export async function searchUsers(searchQuery: string, idGroup: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return { ...curUser, data: [] };
 
    const currentUserId: number = curUser.data.id_utilisateur;
    const [invitationsResult, membresResult] = await Promise.all([
        supabase
            .from("invitation")
            .select("id_recepteur, status_invitation")
            .eq("id_groupe", idGroup)
            .in("status_invitation", ["en_attente", "accepter"]),
        supabase
            .from("membre")
            .select("id_utilisateur")
            .eq("id_groupe", idGroup)
            .is("date_quitte", null),
    ]);
 
    const memberIds = new Set<number>(
        (membresResult.data ?? []).map((m: any) => m.id_utilisateur)
    );
    
    const invitedIds = new Set<number>(
        (invitationsResult.data ?? [])
            .filter((inv: any) => inv.status_invitation === "en_attente")
            .map((inv: any) => inv.id_recepteur)
    );
 
    const { data, error } = await supabase
        .from("utilisateur")
        .select("id_utilisateur, nom, prenom, filiere, photo_profile")
        .or(`nom.ilike.%${searchQuery}%,prenom.ilike.%${searchQuery}%,filiere.ilike.%${searchQuery}%`)
        .neq("id_utilisateur", currentUserId)
        .limit(10);
 
    if (error) {
        console.error("Erreur searchUsers:", error);
        return { success: false, message: "La recherche d'utilisateurs a échoué.", data: [] };
    }
 
    const enriched = (data ?? []).map((u: any) => ({
        id_utilisateur: u.id_utilisateur,
        nom: u.nom,
        prenom: u.prenom,
        filiere: u.filiere,
        photo_profile: u.photo_profile,
        isMember: memberIds.has(u.id_utilisateur),
        isInvited: invitedIds.has(u.id_utilisateur),
    }));
 
    return { success: true, data: enriched };
}




export async function getGroupsDetails(id: number): Promise<ResponseType> {
    const supabase = await createClient();
    const { data: groupeDetails, error } = await supabase.from("groupe").select("id_groupe, nom_groupe, description, type_grp, photo_groupe, membre(count)").eq("id_groupe", id).single();
    if (error) return { success: false, message: error.message };
    return { success: true, data: groupeDetails };
}



export async function deleteGroup(idGroup: number): Promise<ResponseType> {
    const supabase = await createClient();
    const { error } = await supabase.from("groupe").delete().eq("id_groupe", idGroup);
    if (error) return { success: false, message: "Impossible de supprimer le groupe. Veuillez réessayer." };
    return { success: true };
}

export async function updateGroup(idGroup: number, input: GroupeInput, photoFile: File | null, currentPhotoUrl: string | null): Promise<ResponseType> {
    const supabase = await createClient();
    let imageUrl = currentPhotoUrl;
    if (photoFile) {
        const imageResult = await uploadGroupImage(photoFile);
        if (imageResult.success) imageUrl = imageResult.data;
    }
    const { error } = await supabase.from("groupe").update({ nom_groupe: input.nameGroup, description: input.description, photo_groupe: imageUrl }).eq("id_groupe", idGroup);
    if (error) return { success: false, message: "Impossible de modifier le groupe. Veuillez réessayer." };
    return { success: true };
}