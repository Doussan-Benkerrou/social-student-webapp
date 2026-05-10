"use server"

import { createClient } from "@/lib/supabase/server";
import { ResponseType } from "@/lib/types";
import { getCurrentUser } from "./SessionService";
import { getListErrorResponse } from "@/lib/utils";
import { isMembre } from "./memberService";
import { joinGroupAsMember } from "./memberService";
import { createNotification } from "./notificationService";

export async function getInvitations(): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return getListErrorResponse(curUser.message ?? "Impossible de charger les invitations.");

    const { data, error } = await supabase
        .from("invitation")
        .select(`
            *,
            utilisateur_emetteur:fk_invitation_emetteur(nom, prenom, photo_profile),
            groupe:fk_invitation_groupe(nom_groupe)
        `)
        .eq("status_invitation", "en_attente")
        .eq("id_recepteur", curUser.data.id_utilisateur)
        .order("date_envoi", { ascending: false });

    if (error) {
        return getListErrorResponse("Erreur lors du chargement des invitations.");
    }

    return { success: true, data: data ?? [] };
}

export async function acceptInvitation(invitationId: number, idUtilisateur: number, idGroupe: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { data: invitation } = await supabase
        .from("invitation")
        .select("id_emetteur, groupe:fk_invitation_groupe(nom_groupe)")
        .eq("id_invitation", invitationId)
        .single();

    const { error: updateError } = await supabase
        .from("invitation")
        .update({ status_invitation: "accepter" })
        .eq("id_invitation", invitationId)

    if (updateError) {
        return { success: false, message: "Erreur lors de l'acceptation de l'invitation." };
    }

    const member = await joinGroupAsMember(idGroupe,idUtilisateur)
    if(!member.success) {
        return { success: false, message: "Erreur lors de l'ajout comme membre dans accepter invitation." };
    }

    if (invitation?.id_emetteur && invitation.id_emetteur !== curUser.data.id_utilisateur) {
        const nomGroupe = (invitation as any).groupe?.nom_groupe ?? "un groupe";
        await createNotification({
            type_notif: "invitation_acceptee",
            contenu_notif: `${curUser.data.prenom} ${curUser.data.nom} a accepté votre invitation à rejoindre ${nomGroupe}.`,
            id_utilisateur: invitation.id_emetteur,
            id_invitation: invitationId,
        });
    }

    return { success: true, message: "Invitation acceptée." };
}

export async function refuseInvitation(invitationId: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { data: invitation } = await supabase
        .from("invitation")
        .select("id_emetteur, groupe:fk_invitation_groupe(nom_groupe)")
        .eq("id_invitation", invitationId)
        .single();

    const { error } = await supabase
        .from("invitation")
        .update({ status_invitation: "refuser" })
        .eq("id_invitation", invitationId);

    if (error) {
        return { success: false, message: "Erreur lors du refus de l'invitation." };
    }

    if (invitation?.id_emetteur && invitation.id_emetteur !== curUser.data.id_utilisateur) {
        const nomGroupe = (invitation as any).groupe?.nom_groupe ?? "un groupe";
        await createNotification({
            type_notif: "invitation_refusee",
            contenu_notif: `${curUser.data.prenom} ${curUser.data.nom} a refusé votre invitation à rejoindre ${nomGroupe}.`,
            id_utilisateur: invitation.id_emetteur,
            id_invitation: invitationId,
        });
    }

    return { success: true, message: "Invitation refusée." };
}


export async function getPendingInvitationsForGroup(idGroup: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return { ...curUser, data: [] };

    const { data, error } = await supabase
        .from("invitation")
        .select("id_recepteur")
        .eq("id_groupe", idGroup)
        .eq("id_emetteur", curUser.data.id_utilisateur)
        .eq("status_invitation", "en_attente");

    if (error) {
        return { success: false, message: "Impossible de charger les invitations en attente.", data: [] };
    }

    return { success: true, data: (data ?? []).map((i: any) => i.id_recepteur) };
}


export async function inviteUserToGroup(
    idGroupe: number,
    id_emetteur : number,
    idRecepteur: number
): Promise<ResponseType> {
    const supabase = await createClient();
    
    const membre = await isMembre(idGroupe,idRecepteur)
    if (membre){
        return { success: false, message: "le user est deja membre du groupe" };
    }

    const { data: existingInvitation, error: invitationCheckError } = await supabase
        .from("invitation")
        .select("id_invitation, status_invitation")
        .eq("id_groupe", idGroupe)
        .eq("id_emetteur", id_emetteur)
        .eq("id_recepteur", idRecepteur)
        .neq("status_invitation" , "refuser")
        .maybeSingle();

    if (invitationCheckError) {
        return { success: false, message: "Could not verify existing invitations. Please try again." };
    }

    if (existingInvitation) {
        if (existingInvitation.status_invitation === "en_attente" || existingInvitation.status_invitation === "accepter") {
            return { success: false, message: "An invitation has already been sent to this user." };
        }

    }

    const { error } = await supabase
        .from("invitation")
        .insert({
            id_groupe: idGroupe,
            id_emetteur: id_emetteur,
            id_recepteur: idRecepteur,
            status_invitation: "en_attente",
        })
        .select()
        .single();

    if (error) {
        return { success: false, message: "Échec de l'envoi de l'invitation. Veuillez réessayer." };
    }

    const { data: groupe } = await supabase
        .from("groupe")
        .select("nom_groupe")
        .eq("id_groupe", idGroupe)
        .single();
    const nomGroupe = groupe?.nom_groupe ?? "un groupe";


    return { success: true };
}


