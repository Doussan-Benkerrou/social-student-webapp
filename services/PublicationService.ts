"use server"

import { createClient } from "@/lib/supabase/server"
import { pubInput, ResponseType } from "@/lib/types"
import { formatDate, getListErrorResponse, normalizePublications } from "@/lib/utils"
import { getCurrentUser } from "./SessionService"
import { cache } from "react";
import {getReactionUser} from "./reactionService"


const PUBLICATION_SELECT = `
    id_publication, 
    contenu, date_publication, 
    est_anonyme, id_utilisateur,
    auteur:utilisateur!fk_publication_utilisateur(id_utilisateur, nom, prenom, photo_profile, filiere, niveau_etude),
    categorie(id_categorie, nom_categorie),
    groupe(id_groupe, nom_groupe, photo_groupe),
    medias:media(id_media, url_media, type_media),
    reactions:reaction(count),
    commentaires:commentaire(count),
    signalisations:signalisation(id_utilisateur, motif_signale)
`;



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


export async function getPublicationById(id_publication: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser  = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { data: pub, error } = await supabase
        .from("publication").select(PUBLICATION_SELECT)
        .eq("id_publication", id_publication).single();

    if (error || !pub) return { success: false, message: "Publication introuvable." };

    const [reactionRes, favorisRes] = await Promise.all([
        supabase.from("reaction").select("id_publication")
            .eq("id_utilisateur", curUser.data.id_utilisateur).eq("id_publication", id_publication),
        supabase.from("favoris").select("id_publication")
            .eq("id_utilisateur", curUser.data.id_utilisateur).eq("id_publication", id_publication),
    ]);

    const pubsReagir  = new Set<number>(reactionRes.data?.length ? [id_publication] : []);
    const pubsFavoris = new Set<number>(favorisRes.data?.length  ? [id_publication] : []);

    const normalized = normalizePublications(pub, pubsReagir, pubsFavoris, curUser.data.id_utilisateur);

    return {
        success: true,
        data: {
            pub: {
                ...normalized,
                date_publication: formatDate((pub as any).date_publication),
            },
            currentUserId: curUser.data.id_utilisateur,
        },
    };
}


export async function createPublication(pubInput: pubInput): Promise<ResponseType> {
    const supabase = await createClient();

    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { data: pub, error } = await supabase
        .from('publication')
        .insert({
            contenu: pubInput.contenu,
            id_utilisateur: curUser.data.id_utilisateur,
            id_categorie: Number(pubInput.categorieType),
            id_groupe: pubInput.groupId,
            est_anonyme: pubInput.isAnonyme,
        })
        .select()
        .single();

    if (error) {
        return { success: false, message: "Erreur lors de la création de la publication." };
    }

    if (pubInput.pictures && pubInput.pictures.length > 0) {
        const uploadResult = await uploadPostImages(pubInput.pictures, pub.id_publication);
        if (!uploadResult.success) return uploadResult;
    }

    return { success: true, data: pub };
}

export async function uploadPostImages(files: File[], id_publication: number): Promise<ResponseType> {
    const supabase = await createClient();

    for (const file of files) {
        const ext = file.name.split(".").pop();
        const fileName = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("publications")
            .upload(fileName, file);

        if (uploadError) {
            return { success: false, message: uploadError.message || `Upload échoué pour : ${file.name}` };
        }

        const { data } = supabase.storage.from("publications").getPublicUrl(fileName);
        const type = file.type.startsWith('image/') ? 'image' : 'video';

        const { error: mediaError } = await supabase.from('media').insert({
            url_media: data.publicUrl,
            type_media: type,
            id_publication,
        });

        if (mediaError) {
            return { success: false, message: `Erreur lors de l'enregistrement du média : ${file.name}` };
        }
    }

    return { success: true };
}


export async function editPublication(id_publication: number, pubInput: pubInput): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { error } = await supabase
        .from('publication')
        .update({
            contenu: pubInput.contenu,
            id_categorie: Number(pubInput.categorieType),
            est_anonyme: pubInput.isAnonyme,
        })
        .eq('id_publication', id_publication)
        .eq('id_utilisateur', curUser.data.id_utilisateur);

    if (error) {
        return { success: false, message: "Erreur lors de la modification de la publication." };
    }

    if (pubInput.pictures && pubInput.pictures.length > 0) {
        const uploadResult = await uploadPostImages(pubInput.pictures, id_publication);
        if (!uploadResult.success) return uploadResult;
    }
    return { success: true };
}

export async function deletePublication(id_publication: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { error } = await supabase.from('publication').delete().eq('id_publication', id_publication);
    if (error) {
        return { success: false, message: "Erreur lors de la suppression de la publication." };
    }
    return { success: true };
}


export const getCategories = cache(async (): Promise<ResponseType> => {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('categorie')
        .select('id_categorie, nom_categorie')
        .order('id_categorie', { ascending: true });
    if (error) {
        return getListErrorResponse("Erreur lors du chargement des catégories.");
    }
    return { success: true, data: data ?? [] };
});

export async function deletePublicationMedia(id_media: number): Promise<ResponseType> {
    const supabase = await createClient();
    const { error } = await supabase
        .from('media')
        .delete()
        .eq('id_media', id_media);
    if (error) {
        return { success: false, message: "Erreur lors de la suppression du média." };
    }
    return { success: true };
}

export async function subscribeToPublicationsRealtime(groupId: number, onUpdate: () => Promise<void> | void) {
    const supabase = await createClient();
    return supabase
        .channel(`realtime-publications-${groupId}`)
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "reaction" },
            async () => { onUpdate(); }
        )
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "commentaire" },
            async () => { onUpdate(); }
        )
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "publication" },
            async () => { onUpdate(); }
        )
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "favoris" },
            async () => { onUpdate(); }
        )
        .subscribe();
}


export async function getPublicationsByGroupe(
    id_groupe: number,
    page: number = 1,
    limit: number = 20
): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser  = await getCurrentUser();
    if (!curUser.success) return getListErrorResponse(curUser.message ?? "");

    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    const { data: publications, error } = await supabase
        .from("publication").select(PUBLICATION_SELECT)
        .eq("id_groupe", id_groupe)
        .order("date_publication", { ascending: false }).range(from, to);

    if (error) return getListErrorResponse("Impossible de charger les publications du groupe.");

    const normalized = await buildNormalizedPublications(publications ?? [], curUser.data.id_utilisateur);
    return { success: true, data: normalized };
}




//favoris

export async function getFavorisUser(pubIds: number[]): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();

    if (!pubIds || pubIds.length === 0) {
        return { success: true, data: [] };
    }
    if (!curUser.success) return curUser;

    const { data: mesFavoris, error } = await supabase
        .from('favoris')
        .select('id_publication')
        .eq('id_utilisateur', curUser.data.id_utilisateur)
        .in('id_publication', pubIds);

    if (error) {
        return { success: false, message: "Erreur lors de la vérification des favoris." };
    }
    return { success: true, data: mesFavoris ?? [] };
}





export async function favorisPublication(id_publication: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { error } = await supabase
        .from('favoris')
        .insert({
            id_utilisateur: curUser.data.id_utilisateur,
            id_publication,
        });
    if (error) {
        return { success: false, message: "Erreur lors de la sauvegarde de la publication." };
    }
    return { success: true };
}



export async function removeFavorisPublication(id_publication: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { error } = await supabase
        .from('favoris')
        .delete()
        .eq('id_utilisateur', curUser.data.id_utilisateur)
        .eq('id_publication', id_publication);
    if (error) {
        return { success: false, message: "Erreur lors de la suppression du favori." };
    }
    return { success: true };
}

export async function getFavorisPublications(): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser  = await getCurrentUser();
    if (!curUser.success) return getListErrorResponse(curUser.message ?? "");

    const { data: favoris, error: favError } = await supabase
        .from("favoris").select("id_publication").eq("id_utilisateur", curUser.data.id_utilisateur);

    if (favError) return getListErrorResponse("Impossible de charger vos publications favorites.");

    const pubIds = (favoris ?? []).map((f: any) => f.id_publication);
    if (pubIds.length === 0) return { success: true, data: [] };

    const { data: publications, error: pubError } = await supabase
        .from("publication").select(PUBLICATION_SELECT)
        .in("id_publication", pubIds).order("date_publication", { ascending: false });

    if (pubError) return getListErrorResponse("Impossible de charger vos publications favorites.");

    const normalized = await buildNormalizedPublications(publications ?? [], curUser.data.id_utilisateur);
    return { success: true, data: normalized };
}



