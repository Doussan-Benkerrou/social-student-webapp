"use server";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { ResponseType } from "@/lib/types";

export const getProfile = cache(async (): Promise<ResponseType<any>> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Non authentifié" };

  const { data, error } = await supabase
    .from("utilisateur")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (error) return { success: false, message: "Erreur récupération profil" };
  return { success: true, data };
});

export const getProfileById = cache(
  async (id_utilisateur: number): Promise<ResponseType<any>> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("utilisateur")
      .select("*")
      .eq("id_utilisateur", id_utilisateur)
      .single();

    if (error)
      return { success: false, message: "Erreur récupération profil" };
    return { success: true, data };
  }
);

export async function updateProfile(payload: {
  bio: string;
  filiere: string;
  niveau_etude: string;
  photo_profile?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Non authentifié" };

  const { error } = await supabase
    .from("utilisateur")
    .update({
      bio: payload.bio,
      filiere: payload.filiere,
      niveau_etude: payload.niveau_etude,
      ...(payload.photo_profile !== undefined && {
        photo_profile: payload.photo_profile,
      }),
    })
    .eq("auth_id", user.id);

  if (error) return { success: false, message: error.message };
  return { success: true };
}


export async function updateProfilePhoto(
  publicUrl: string
): Promise<ResponseType> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Non authentifié" };

  const { error } = await supabase
    .from("utilisateur")
    .update({ photo_profile: publicUrl })
    .eq("auth_id", user.id);

  if (error) return { success: false, message: error.message };
  return { success: true };
}


export async function removeProfilePhoto(): Promise<ResponseType> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Non authentifié" };

  const { error } = await supabase
    .from("utilisateur")
    .update({ photo_profile: null })
    .eq("auth_id", user.id);

  if (error) return { success: false, message: error.message };
  return { success: true };
}


export async function getCurrentAuthId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}