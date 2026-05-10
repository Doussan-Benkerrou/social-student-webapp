"use server"

import { createClient } from "@/lib/supabase/server"
import { ResponseType } from "@/lib/types"
import { getListErrorResponse } from "@/lib/utils"
import { getCurrentUser } from "./SessionService"
import { createNotification } from "./notificationService"


export async function deleteCommentaire(id_commentaire: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;
    const { error } = await supabase
        .from('commentaire')
        .delete()
        .eq('id_commentaire', id_commentaire)
        .eq('id_utilisateur', curUser.data.id_utilisateur);

    if (error) {
        return { success: false, message: "Erreur lors de la suppression du commentaire." };
    }
    return { success: true };
}


export async function repondreCommentaire(id_publication: number, id_commentaire_parent: number, contenu: string): Promise<ResponseType> {
    const supabase = await createClient();

    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { data: parentCom, error: parentError } = await supabase
        .from('commentaire')
        .select('id_commentaire, id_publication, id_utilisateur')
        .eq('id_commentaire', id_commentaire_parent)
        .single();

    if (parentError || !parentCom) {
        return { success: false, message: "Commentaire parent introuvable." };
    }

    if (parentCom.id_publication !== id_publication) {
        return { success: false, message: "Ce commentaire n'appartient pas à cette publication." };
    }

    const { data: reponse, error } = await supabase
        .from('commentaire')
        .insert({
            contenu_com: contenu,
            id_utilisateur: curUser.data.id_utilisateur,
            id_publication,
            id_commentaire_parent,
        })
        .select(`
            id_commentaire,
            contenu_com,
            date_com,
            id_commentaire_parent,
            auteur:utilisateur (
                id_utilisateur,
                nom,
                prenom,
                photo_profile
            )
        `)
        .single();

    if (error) {
        return { success: false, message: "Erreur lors de l'ajout de la réponse." };
    }

    if (parentCom.id_utilisateur && parentCom.id_utilisateur !== curUser.data.id_utilisateur) {
        await createNotification({
            type_notif: "reponse_commentaire",
            contenu_notif: `${curUser.data.prenom} ${curUser.data.nom} a répondu à votre commentaire.`,
            id_utilisateur: parentCom.id_utilisateur,
            id_commentaire: reponse.id_commentaire,
        });
    }

    return { success: true, data: reponse };
}

export async function ajouterCommentaire(id_publication: number, contenu: string): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { data: commentaire, error } = await supabase
        .from('commentaire')
        .insert({
            contenu_com: contenu,
            id_utilisateur: curUser.data.id_utilisateur,
            id_publication,
        })
        .select(`
            id_commentaire,
            contenu_com,
            date_com,
            id_commentaire_parent,
            auteur:utilisateur (
                id_utilisateur,
                nom,
                prenom,
                photo_profile
            )
        `)
        .single();

    if (error) {
        return { success: false, message: "Erreur lors de l'ajout du commentaire." };
    }

    const { data: publication } = await supabase
        .from('publication')
        .select('id_utilisateur')
        .eq('id_publication', id_publication)
        .single();

    if (publication && publication.id_utilisateur !== curUser.data.id_utilisateur) {
        await createNotification({
            type_notif: "commentaire",
            contenu_notif: `${curUser.data.prenom} ${curUser.data.nom} a commenté votre publication.`,
            id_utilisateur: publication.id_utilisateur,
            id_commentaire: commentaire.id_commentaire,
        });
    }

    return { success: true, data: commentaire };
}


export async function getCommentairesByPublication(id_publication: number): Promise<ResponseType> {
    const supabase = await createClient();

    const { data: commentaires, error } = await supabase
        .from('commentaire')
        .select(`
            id_commentaire,
            contenu_com,
            date_com,
            id_commentaire_parent,
            auteur:utilisateur (
                id_utilisateur,
                nom,
                prenom,
                photo_profile
            )
        `)
        .eq('id_publication', id_publication)
        .order('date_com', { ascending: true });

    if (error) {
        return getListErrorResponse(error.message || "Impossible de charger les commentaires.");
    }

    return { success: true, data: commentaires ?? [] };
}