"use server"

import { LoginInput, ResponseType, RegisterInput, ResetPasswordInput } from "@/lib/types"
import { createClient } from "@/lib/supabase/server"

export async function loginWithEmail({
    email,
    password,
}: LoginInput): Promise<ResponseType> {
    const supabase = await createClient()

    const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (loginError) {
        return {
            success: false,
            message: "Email ou mot de passe incorrect.",
        }
    }

    return {
        success: true,
        message: "Connexion réussie.",
    }
}


async function deleteAuthUserIfAvailable(supabase: any, userId: string) {
    try {
        const adminClient = (supabase.auth as any)?.admin
        if (adminClient?.deleteUser) {
            await adminClient.deleteUser(userId)
        }
    } catch {
    }
}

export async function register(data: RegisterInput): Promise<ResponseType<any>> {
    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email_univer,
        password: data.password,
    })

    if (authError || !authData.user) {
        return {
            success: false,
            message: "Erreur lors de la création d'un nouvel utilisateur.",
        }
    }

    const { error: profileError } = await supabase.from("utilisateur").insert({
        auth_id: authData.user.id,
        nom: data.nom,
        prenom: data.prenom,
        date_naissance: data.date_naissance,
        sexe: data.sexe,
        email_univer: data.email_univer,
        numero_tel: data.numero_tel,
        adresse: data.adresse,
    })

    if (profileError) {
        await deleteAuthUserIfAvailable(supabase, authData.user.id)
        return {
            success: false,
            message: "Erreur lors de la création du profil utilisateur.",
        }
    }

    return {
        success: true,
        message: "Inscription réussie.",
    }
}

export async function forgotPassword(email_univer: string): Promise<ResponseType> {
    const supabase = await createClient()

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email_univer,
        {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/reset-password`,
        }
    )

    if (resetError) {
        return {
            success: false,
            message: "Erreur lors de l'envoi du lien de réinitialisation du mot de passe.",
        }
    }

    return {
        success: true,
        message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    }
}

export async function resetPassword(
    data: ResetPasswordInput
): Promise<ResponseType> {
    const supabase = await createClient()

    const { error: updateError } = await supabase.auth.updateUser({
        password: data.new_password,
    })

    if (updateError) {
        return {
            success: false,
            message: "Erreur lors de la mise à jour du mot de passe utilisateur.",
        }
    }

    return {
        success: true,
        message: "Mot de passe mis à jour avec succès.",
    }
}




