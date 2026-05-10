"use server";

import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import type { ResponseType } from "@/lib/types";


export const getCurrentUser = cache(async (): Promise<ResponseType> => {
    const supabase = await createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
        return { success: false, message: "Non authentifié." };
    }

    const { data: userProfile, error: userProfileError } = await supabase
        .from("utilisateur")
        .select("id_utilisateur, nom, prenom, photo_profile, filiere, niveau_etude")
        .eq("auth_id", userData.user.id)
        .single();

    if (userProfileError || !userProfile) {
        return { success: false, message: "Profil introuvable." };
    }

    return { success: true, data: userProfile };
});