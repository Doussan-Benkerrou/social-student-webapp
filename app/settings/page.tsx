import { redirect } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import { getCurrentUser } from "@/services/SessionService"
import { createClient } from "@/lib/supabase/server"
import type { UserProfile } from "@/lib/types"
import SettingsClient from "./SettingsClient"

const PROFILE_COLUMNS =
    "id_utilisateur, auth_id, nom, prenom, date_naissance, email_univer, numero_tel, adresse, sexe, photo_profile, bio, filiere, niveau_etude";

function buildFallbackProfile(curUser: {
    id_utilisateur: number;
    nom?: string | null;
    prenom?: string | null;
    photo_profile?: string | null;
    filiere?: string | null;
    niveau_etude?: string | null;
}, email: string): UserProfile {
    return {
        id_utilisateur: Number(curUser.id_utilisateur),
        auth_id: null,
        nom: curUser.nom ?? "",
        prenom: curUser.prenom ?? "",
        date_naissance: null,
        email_univer: email,
        numero_tel: "",
        adresse: "",
        sexe: null,
        photo_profile: curUser.photo_profile ?? null,
        bio: null,
        filiere: curUser.filiere ?? null,
        niveau_etude: curUser.niveau_etude ?? null,
    };
}

export const dynamic = "force-dynamic";

export default async function SettingsPage() {


    const curUser = await getCurrentUser();
    if (!curUser.success || !curUser.data?.id_utilisateur) redirect("/auth/login");

    const safeCurUser = {
        success: true,
        data: {
            id_utilisateur: Number(curUser.data.id_utilisateur),
            nom: curUser.data.nom ?? "",
            prenom: curUser.data.prenom ?? "",
            photo_profile: curUser.data.photo_profile ?? null,
            filiere: curUser.data.filiere ?? null,
            niveau_etude: curUser.data.niveau_etude ?? null,
        },
    };

    const sessionData = curUser.data as { user?: { email?: string | null } } | undefined;
    const authEmail = typeof sessionData?.user?.email === "string" ? sessionData.user.email : "";

    const supabase = await createClient();
    const { data: profile } = await supabase
        .from("utilisateur")
        .select(PROFILE_COLUMNS)
        .eq("id_utilisateur", safeCurUser.data.id_utilisateur)
        .maybeSingle();

    const safeProfile: UserProfile = profile
        ? {
            id_utilisateur: Number(profile.id_utilisateur),
            auth_id: profile.auth_id ?? null,
            nom: profile.nom ?? "",
            prenom: profile.prenom ?? "",
            date_naissance: profile.date_naissance ?? null,
            email_univer: profile.email_univer ?? "",
            numero_tel: profile.numero_tel ?? "",
            adresse: profile.adresse ?? "",
            sexe: profile.sexe ?? null,
            photo_profile: profile.photo_profile ?? null,
            bio: profile.bio ?? null,
            filiere: profile.filiere ?? null,
            niveau_etude: profile.niveau_etude ?? null,
        }
        : buildFallbackProfile(safeCurUser.data, authEmail);

    const safeAuthEmail = authEmail || safeProfile.email_univer || "";

    return (
        <AppLayout curUser={safeCurUser}>
            <SettingsClient
                initialProfile={safeProfile}
                initialAuthEmail={safeAuthEmail}
            />
            
        </AppLayout>
    );
}
