"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { validateProfileInput } from "@/lib/validations/profile";
import type { UserProfile, UserProfileUpdate } from "@/lib/types";
import {
    deleteSupabaseAuthUser,
    deleteUserApplicationData,
} from "@/services/accountService";

const PROFILE_COLUMNS =
    "id_utilisateur, auth_id, nom, prenom, date_naissance, email_univer, numero_tel, adresse, sexe, photo_profile, bio, filiere, niveau_etude";


export async function updateCurrentUserProfileAction(values: UserProfileUpdate): Promise<{
    success: boolean;
    message: string;
    profile?: UserProfile;
}> {
    try {
        const validationError = validateProfileInput(values);
        if (validationError) {
            return { success: false, message: validationError };
        }

        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                message: authError?.message || "Session introuvable. Veuillez vous reconnecter.",
            };
        }

        const { data: updatedProfile, error: updateError } = await supabase
            .from("utilisateur")
            .update(values)
            .eq("auth_id", user.id)
            .select(PROFILE_COLUMNS)
            .single();

        if (updateError) {
            return {
                success: false,
                message: updateError.message || "Impossible d'enregistrer les modifications.",
            };
        }

        revalidatePath("/settings");

        return {
            success: true,
            message: "Profil mis à jour avec succès.",
            profile: {
                id_utilisateur: Number(updatedProfile.id_utilisateur),
                auth_id: updatedProfile.auth_id ?? null,
                nom: updatedProfile.nom ?? "",
                prenom: updatedProfile.prenom ?? "",
                date_naissance: updatedProfile.date_naissance ?? null,
                email_univer: updatedProfile.email_univer ?? "",
                numero_tel: updatedProfile.numero_tel ?? "",
                adresse: updatedProfile.adresse ?? "",
                sexe: updatedProfile.sexe ?? null,
                photo_profile: updatedProfile.photo_profile ?? null,
                bio: updatedProfile.bio ?? null,
                filiere: updatedProfile.filiere ?? null,
                niveau_etude: updatedProfile.niveau_etude ?? null,
            },
        };
    } catch (error) {
        const message =
            typeof error === "object" && error && "message" in error
                ? String((error as { message?: unknown }).message ?? "")
                : "";

        return {
            success: false,
            message: message || "Impossible d'enregistrer les modifications.",
        };
    }
}

export async function deleteCurrentUserAccountAction() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
            return {
                success: false,
                message: "Impossible de vérifier votre session actuelle.",
            };
        }

        if (!user) {
            return {
                success: false,
                message: "Aucun utilisateur connecté n'a été trouvé.",
            };
        }

        const adminClient = createAdminClient();
        await deleteUserApplicationData(adminClient, user.id);
        await deleteSupabaseAuthUser(adminClient, user.id);

        revalidatePath("/settings");

        return {
            success: true,
            message: "Votre compte a été supprimé définitivement.",
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "La suppression du compte a échoué.",
        };
    }
}
