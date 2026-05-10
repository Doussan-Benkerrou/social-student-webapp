"use server"

import { createClient } from "@/lib/supabase/server"
import { pubInput, ResponseType } from "@/lib/types"
import { formatDate, getListErrorResponse, normalizePublications } from "@/lib/utils"
import { getCurrentUser } from "./SessionService"
import { createNotification } from "./notificationService"
import { cache } from "react";


export async function getReactionUser(pubIds: number[]): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();

    if (!pubIds || pubIds.length === 0) {
        return { success: true, data: [] };
    }
    if (!curUser.success) return curUser;

    const { data: mesReactions, error } = await supabase
        .from('reaction')
        .select('id_publication')
        .eq('id_utilisateur', curUser.data.id_utilisateur)
        .in('id_publication', pubIds);

    if (error) {
        return { success: false, message: "Erreur lors de la vérification des réactions." };
    }
    return { success: true, data: mesReactions ?? [] };
}

export async function signalisationPublication(id_publication: number, motif: string): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { error } = await supabase
        .from('signalisation')
        .insert({
            id_utilisateur: curUser.data.id_utilisateur,
            id_publication,
            motif_signale: motif,
        });
    if (error) {
        if (error.code === '23505') {
            return { success: false, message: "Vous avez déjà signalé cette publication." };
        }
        return { success: false, message: "Erreur lors du signalement de la publication." };
    }
    return { success: true };
}


export async function getSignalisationByPublication(id_publication: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { data, error } = await supabase
        .from('signalisation')
        .select('*')
        .eq('id_utilisateur', curUser.data.id_utilisateur)
        .eq('id_publication', id_publication)
        .single();

    if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
            return { success: true, data: null };
        }
        return { success: false, message: "Erreur lors de la vérification du signalement." };
    }

    return { success: true, data };
}

export async function updateSignalisationPublication(id_publication: number, motif: string): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { error } = await supabase
        .from('signalisation')
        .update({ motif_signale: motif })
        .eq('id_utilisateur', curUser.data.id_utilisateur)
        .eq('id_publication', id_publication);

    if (error) {
        return { success: false, message: "Erreur lors de la mise à jour du signalement de la publication." };
    }

    return { success: true };
}

export async function reactionPublication(id_publication: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { error } = await supabase
        .from('reaction')
        .insert({
            id_utilisateur: curUser.data.id_utilisateur,
            id_publication,
        });
    if (error) {
        return { success: false, message: "Erreur lors de l'ajout de la réaction." };
    }

    const { data: publication } = await supabase
        .from('publication')
        .select('id_utilisateur')
        .eq('id_publication', id_publication)
        .single();

    if (publication && publication.id_utilisateur !== curUser.data.id_utilisateur) {
        await createNotification({
            type_notif: "reaction",
            contenu_notif: `${curUser.data.prenom} ${curUser.data.nom} a aimé votre publication.`,
            id_utilisateur: publication.id_utilisateur,
            id_publication: id_publication,
        });
    }

    return { success: true };
}

export async function removeReactionPublication(id_publication: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { error } = await supabase
        .from('reaction')
        .delete()
        .eq('id_utilisateur', curUser.data.id_utilisateur)
        .eq('id_publication', id_publication);
    if (error) {
        return { success: false, message: "Erreur lors de la suppression de la réaction." };
    }
    return { success: true };
}

export async function removeSignalisationPublication(id_publication: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { error } = await supabase
        .from('signalisation')
        .delete()
        .eq('id_utilisateur', curUser.data.id_utilisateur)
        .eq('id_publication', id_publication);
    if (error) {
        return { success: false, message: "Erreur lors de la suppression du signalement." };
    }
    return { success: true };
}