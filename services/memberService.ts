"use server"
import { ResponseType } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./SessionService";
import { getListErrorResponse } from "@/lib/utils";

export async function isMember(id_groupe:number,id_user:number):
Promise<ResponseType> {
    
    const supabase = await createClient()
    const {data : membre,error} = await supabase
    .from('membre')
    .select('*')
    .eq('id_groupe' , id_groupe)
    .eq('id_utilisateur' , id_user)
    .is('date_quitte',null)
    .maybeSingle()

    if(error) {
        console.error("erreur is member")
        return {success:false}
    }

    if(membre===null){
        return {success:false}
    }
    return {success:true}
}

export async function isMembre(
  id_groupe: number,
  id_utilisateur: number
): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("membre")
    .select("id_utilisateur")
    .eq("id_groupe", id_groupe)
    .eq("id_utilisateur", id_utilisateur)
    .is("date_quitte", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return !!data;
}

export async function getUserGroupIds(): Promise<ResponseType> {
    const supabase = await createClient();
    const userResult = await getCurrentUser();
    if (!userResult.success) {
        return { ...userResult, data: [] };
    }
    const { data, error } = await supabase
    .from("membre")
    .select("id_groupe")
    .eq("id_utilisateur", userResult.data.id_utilisateur)
    .is("date_quitte", null);

    if (error) 
        return { success: false, message: "Impossible de charger vos adhésions au groupe.", data: [] };
    return { success: true, data: (data ?? []).map((m: any) => m.id_groupe) };
}





export async function getUserStatusInGroup(idGroup: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const userId = curUser.data.id_utilisateur;

    const { data: memberData } = await supabase
        .from("membre")
        .select("role")
        .eq("id_groupe", idGroup)
        .eq("id_utilisateur", userId)
        .is("date_quitte", null)
        .maybeSingle();

    if (memberData) return { success: true, data: memberData.role };

    const { data: inviteAsReceiver } = await supabase
        .from("invitation")
        .select("status_invitation")
        .eq("id_groupe", idGroup)
        .eq("id_recepteur", userId)
        .order("id_invitation", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (inviteAsReceiver?.status_invitation === "en_attente") {
        return { success: true, data: "pending" };
    }

    
    const { data: inviteAsSender } = await supabase
        .from("invitation")
        .select("status_invitation")
        .eq("id_groupe", idGroup)
        .eq("id_emetteur", userId)
        .eq("status_invitation", "accepter")
        .order("id_invitation", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (inviteAsSender?.status_invitation === "accepter") {
        const { data: recheckMember } = await supabase
            .from("membre")
            .select("role")
            .eq("id_groupe", idGroup)
            .eq("id_utilisateur", userId)
            .is("date_quitte", null)
            .maybeSingle();
        
        if (recheckMember) return { success: true, data: recheckMember.role };
    }

    return { success: true, data: "none" };
}




export async function getGroupMembers(idGroup: number): Promise<ResponseType> {
    const supabase = await createClient();

    const { data, error } = await supabase
    .from("membre")
    .select(`role, utilisateur(id_utilisateur, nom, prenom, filiere, niveau_etude, photo_profile)`)
    .eq("id_groupe", idGroup)
    .is("date_quitte", null);

    if (error) return getListErrorResponse("Impossible de charger les membres du groupe.");
    return { success: true, data: data ?? [] };
}


export async function leaveGroup(idGroup: number): Promise<ResponseType> {
    const supabase = await createClient();
    const curUser = await getCurrentUser();
    if (!curUser.success) return curUser;

    const { error } = await supabase
    .from("membre")
    .update({ date_quitte: new Date().toISOString() })
    .eq("id_groupe", idGroup)
    .eq("id_utilisateur", curUser.data.id_utilisateur);

    if (error) return { success: false, message: "Impossible de quitter le groupe. Veuillez réessayer." };

    await supabase.from("invitation")
        .delete()
        .eq("id_groupe", idGroup)
        .eq("id_emetteur", curUser.data.id_utilisateur)
        .in("status_invitation", ["accepter", "en_attente"]);
    return { success: true };
}

export async function removeMemberFromGroup(idGroup: number, idUser: number): Promise<ResponseType> {
    const supabase = await createClient();

    const { error } = await supabase
    .from("membre")
    .update({ date_quitte: new Date().toISOString() })
    .eq("id_groupe", idGroup)
    .eq("id_utilisateur", idUser);

    if (error) return { success: false, message: "Impossible de retirer ce membre. Veuillez réessayer." };
    return { success: true };
}


export async function joinGroupAsMember(idGroupe: number,id_user:number): Promise<ResponseType> {
    const supabase = await createClient();

    const member = await isMembre(idGroupe,id_user)
    if (member){
        return { success: false, message: "vous etes deja membre du groupe joinGRoupAsMember" };
    }
    
    const { error } = await supabase
    .from('membre')
    .insert(
        { 
            id_groupe: idGroupe,
            id_utilisateur: id_user, 
            role : "membre" 
        }
    )
    .select()
    .single();

    if (error) 
        return { success: false, message: error.message };
    

    return { success: true };
}

export async function joinGroupAsAdmin(idGroupe: number,id_user:number): Promise<ResponseType> {
    const supabase = await createClient();

    const member = await isMembre(idGroupe,id_user)
    if (member){
        return { success: false, message: "vous etes deja membre du groupe joinGRoupAsMember" };
    }

    const {error } = await supabase
    .from('membre')
    .insert(
        { 
            id_groupe: idGroupe,
            id_utilisateur: id_user, 
            role : "admin" 
        }
    )
    .select()
    .single();

    if (error) 
        return { success: false, message: error.message };
    
    return { success: true };
}