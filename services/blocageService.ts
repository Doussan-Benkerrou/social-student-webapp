"use server";

import { createClient } from "@/lib/supabase/server";
import type { ResponseType } from "@/lib/types";

// type Blocage = {
//   id_bloqueur: number;
//   id_bloque: number;
//   date_blocage: Date | string;
// };


export async function blockUser(
  currentUserId: number,
  otherUser: number
): Promise<ResponseType> {
  if (currentUserId === otherUser) {
    return { success: false, message: "Vous ne pouvez pas vous bloquer vous-même." };
  }
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("blocage")
    .select("id_bloqueur")
    .eq("id_bloqueur", currentUserId)
    .eq("id_bloque", otherUser)
    .maybeSingle();

  if (existing) return { success: true, message: "Déjà bloqué." };

  const { data, error } = await supabase
    .from("blocage")
    .insert({ id_bloqueur: currentUserId, id_bloque: otherUser })
    .select()
    .single();

  if (error) {
    console.error("[blockUser]", error.message);
    return { success: false, message: "Erreur lors du blocage." };
  }

  return { success: true, data, message: "Utilisateur bloqué." };
}


export async function unblockUser(
  currentUserId: number,
  otherUser: number
): Promise<ResponseType> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("blocage")
    .delete()
    .eq("id_bloqueur", currentUserId)
    .eq("id_bloque", otherUser);

  if (error) {
    console.error("[unblockUser]", error.message);
    return { success: false, message: "Erreur lors du déblocage." };
  }

  return { success: true, message: "Utilisateur débloqué." };
}



export async function getBlockedUsers(
  currentUserId: number
): Promise<ResponseType> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blocage")
    .select(
      `id_bloque, date_blocage,
       utilisateur!fk_blocage_bloque (nom, prenom, photo_profile)`
    )
    .eq("id_bloqueur", currentUserId)
    .order("date_blocage", { ascending: false });

  if (error) {
    console.error("[getBlockedUsers]", error.message);
    return { success: false, message: "Erreur récupération liste blocage." };
  }

  return { success: true, data };
}


// verifie dans les deux senses
export async function isBlocked(userA: number, userB: number): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocage")
    .select("id_bloqueur")
    .or(
      `and(id_bloqueur.eq.${userA},id_bloque.eq.${userB}),` +
        `and(id_bloqueur.eq.${userB},id_bloque.eq.${userA})`
    )
    .limit(1)
    .maybeSingle();

  return data !== null;
}


export async function checkBlockStatus(
  currentUserId: number,
  otherUserId: number
): Promise<{ iBlockedThem: boolean; theyBlockedMe: boolean }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocage")
    .select("id_bloqueur, id_bloque")
    .or(
      `and(id_bloqueur.eq.${currentUserId},id_bloque.eq.${otherUserId}),` +
        `and(id_bloqueur.eq.${otherUserId},id_bloque.eq.${currentUserId})`
    );

  const rows = data ?? [];
  return {
    iBlockedThem: rows.some(
      (r: any) => r.id_bloqueur === currentUserId && r.id_bloque === otherUserId
    ),
    theyBlockedMe: rows.some(
      (r: any) => r.id_bloqueur === otherUserId && r.id_bloque === currentUserId
    ),
  };
}