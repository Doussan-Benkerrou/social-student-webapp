import { createClient } from "@/lib/supabase/client";
import { createGroupDiscussion } from "./discussionService";
import {Groupe , Membre , GroupeWithMeta} from '@/lib/types'





export async function fetchGroupesDiscussion(
  currentUserId: number
): Promise<GroupeWithMeta[]> {
  const supabase = await createClient()
  const [groupesResult, invitationsResult] = await Promise.all([
    supabase
      .from("groupe")
      .select(`
        *,
        membre (
          id_utilisateur,
          role,
          date_quitte
        )
      `)
      .eq("type_grp", "discussion")
      .is("membre.date_quitte", null),
    supabase
      .from("invitation")
      .select("id_groupe")
      .eq("id_emetteur", currentUserId)
      .eq("status_invitation", "en_attente"),
  ]);

  if (groupesResult.error) throw new Error(groupesResult.error.message);

  const pendingGroupIds = new Set<number>(
    (invitationsResult.data ?? []).map((i: any) => i.id_groupe)
  );

  return (groupesResult.data ?? []).map((g: any) => {
    const membres: Membre[] = g.membre ?? [];
    const activeMembres = membres.filter((m) => !m.date_quitte);
    const myMembership = activeMembres.find(
      (m) => m.id_utilisateur === currentUserId
    );

    return {
      id_groupe: g.id_groupe,
      nom_groupe: g.nom_groupe,
      photo_groupe: g.photo_groupe,
      description: g.description,
      date_creation: g.date_creation,
      type_grp: g.type_grp,
      id_createur: g.id_createur,
      nombreMembres: activeMembres.length,
      isMember: !!myMembership,
      isAdmin: myMembership?.role === "admin",
      pendingRequest: pendingGroupIds.has(g.id_groupe),
    };
  });
}


export async function createGroupe(
  nom_groupe: string,
  description: string,
  currentUserId: number
): Promise<Groupe> {
  const supabase = await createClient()
  const { data: groupe, error: groupeError } = await supabase
    .from("groupe")
    .insert({
      nom_groupe,
      description: description || null,
      type_grp: "discussion",
      id_createur: currentUserId,
    })
    .select()
    .single();

  if (groupeError) throw new Error(groupeError.message);
  
  const discussion = await createGroupDiscussion(groupe.id_groupe);
  if (!discussion) {
    throw new Error(
      `Groupe créé (nom=${groupe.nom_groupe}) mais impossible de créer sa discussion.`
    );
  }

  const { error: membreError } = await supabase
  .from("membre")
  .insert({
    id_groupe: groupe.id_groupe,
    id_utilisateur: currentUserId,
    role: "admin",
  });

  if (membreError) throw new Error(membreError.message);

  return groupe;
}



export async function joinGroupe(
  id_groupe: number,
  currentUserId: number
): Promise<void> {
  const supabase = await createClient()
  const { data: adminRow, error: adminError } = await supabase
    .from("membre")
    .select("id_utilisateur")
    .eq("id_groupe", id_groupe)
    .eq("role", "admin")
    .is("date_quitte", null)
    .maybeSingle();

  if (adminError || !adminRow) throw new Error("Impossible de trouver l'administrateur du groupe.");

  const { data: existing } = await supabase
    .from("invitation")
    .select("id_invitation")
    .eq("id_groupe", id_groupe)
    .eq("id_emetteur", currentUserId)
    .eq("id_recepteur", adminRow.id_utilisateur)
    .in("status_invitation", ["en_attente", "accepter"])
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from("invitation").insert({
    id_groupe,
    id_emetteur: currentUserId,
    id_recepteur: adminRow.id_utilisateur,
    status_invitation: "en_attente",
  });

  if (error) throw new Error(error.message);
}


export async function getDiscussionIdByGroupe(id_groupe: number): Promise<number | null> {
    const supabase = createClient(); 
    
    const { data, error } = await supabase
      .from("discussion")
      .select("id_discussion")
      .eq("id_groupe", id_groupe)
      .maybeSingle();

    if (error) {
      console.error("Erreur getDiscussionIdByGroupe:", error.message);
      return null;
    }
    
    return data?.id_discussion ?? null;
}


export async function inviteToGroupe(
  id_groupe: number,
  id_utilisateur: number
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("membre").insert({
    id_groupe,
    id_utilisateur,
    role: "membre",
  });

  if (error) throw new Error(error.message);
}




export async function fetchNonMembres(
  id_groupe: number
): Promise<{ id_utilisateur: number; nom: string; prenom: string; filiere: string }[]> {
  const supabase = await createClient()
  const { data: membres, error: membresError } = await supabase
    .from("membre")
    .select("id_utilisateur")
    .eq("id_groupe", id_groupe)
    .is("date_quitte", null);

  if (membresError) throw new Error(membresError.message);

  const memberIds = (membres ?? []).map((m: any) => m.id_utilisateur);

  const query = supabase
    .from("utilisateur")
    .select("id_utilisateur, nom, prenom, filiere");

  if (memberIds.length > 0) {
    query.not("id_utilisateur", "in", `(${memberIds.join(",")})`);
  }

  const { data: users, error: usersError } = await query;
  if (usersError) throw new Error(usersError.message);

  return users ?? [];
}