"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { validateProfileInput } from "@/lib/validations/profile";
import { validatePasswordUpdate } from "@/lib/validations/password";
import {
    updateAuthenticatedUserEmail,
    updateAuthenticatedUserPassword,
    verifyCurrentPassword,
    signOutCurrentUser,
} from "@/services/authClientService";
import { deleteCurrentUserAccountAction, updateCurrentUserProfileAction } from "@/app/settings/actions";
import type { UserProfile, UserProfileUpdate } from "@/lib/types";

export function useSettings(initialProfile: UserProfile, initialAuthEmail: string) {
    const supabase = useMemo(() => createClient(), []);

    const [nom, setNom]         = useState(initialProfile.nom ?? "");
    const [prenom, setPrenom]   = useState(initialProfile.prenom ?? "");
    const [email, setEmail]     = useState(initialProfile.email_univer ?? "");
    const [tel, setTel]         = useState(initialProfile.numero_tel ?? "");
    const [adresse, setAdresse] = useState(initialProfile.adresse ?? "");
    const [bio, setBio]         = useState(initialProfile.bio ?? "");
    const [filiere, setFiliere] = useState(initialProfile.filiere ?? "");
    const [niveau, setNiveau]   = useState(initialProfile.niveau_etude ?? "");
    const [authEmail, setAuthEmail] = useState(initialAuthEmail || initialProfile.email_univer || "");

    const [oldPwd, setOldPwd]   = useState("");
    const [newPwd, setNewPwd]   = useState("");
    const [confPwd, setConfPwd] = useState("");

    const [deletePwd, setDeletePwd] = useState("");

    const [savingProfile, setSavingProfile]       = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [signingOut, setSigningOut]             = useState(false);
    const [deletingAccount, setDeletingAccount]   = useState(false);

    const [profileFeedback, setProfileFeedback]   = useState<string | null>(null);
    const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
    const [deleteFeedback, setDeleteFeedback]     = useState<string | null>(null);


    async function handleSaveProfile() {
        const payload: UserProfileUpdate = { nom, prenom, email_univer: email, numero_tel: tel, adresse, bio, filiere, niveau_etude: niveau };
        const validationError = validateProfileInput(payload);
        if (validationError) { setProfileFeedback(validationError); return; }

        try {
            setSavingProfile(true);
            setProfileFeedback(null);

            let emailMessage = "";
            if (authEmail && email !== authEmail) {
                const updatedAuthUser = await updateAuthenticatedUserEmail(supabase, email);
                emailMessage = " Vérifiez votre boîte mail si une confirmation est demandée.";
                setAuthEmail(updatedAuthUser?.email ?? authEmail);
            }

            const result = await updateCurrentUserProfileAction(payload);
            if (!result.success) { setProfileFeedback(result.message || "Impossible d'enregistrer."); return; }

            if (result.profile) {
                setNom(result.profile.nom ?? "");
                setPrenom(result.profile.prenom ?? "");
                setEmail(result.profile.email_univer ?? "");
                setTel(result.profile.numero_tel ?? "");
                setAdresse(result.profile.adresse ?? "");
                setBio(result.profile.bio ?? "");
                setFiliere(result.profile.filiere ?? "");
                setNiveau(result.profile.niveau_etude ?? "");
            }

            setProfileFeedback(`${result.message}${emailMessage}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : "";
            setProfileFeedback(message || "Impossible d'enregistrer les modifications.");
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleUpdatePassword() {
        const validationError = validatePasswordUpdate(newPwd, confPwd, oldPwd);
        if (validationError) { setPasswordFeedback(validationError); return; }

        try {
            setUpdatingPassword(true);
            setPasswordFeedback(null);
            await verifyCurrentPassword(supabase, authEmail || email, oldPwd);
            await updateAuthenticatedUserPassword(supabase, newPwd);
            setPasswordFeedback("Mot de passe mis à jour avec succès.");
            setOldPwd(""); setNewPwd(""); setConfPwd("");
        } catch (err) {
            setPasswordFeedback(err instanceof Error ? err.message : "Impossible de mettre à jour le mot de passe.");
        } finally {
            setUpdatingPassword(false);
        }
    }

    async function handleSignOut() {
        try {
            setSigningOut(true);
            await signOutCurrentUser(supabase);
            window.location.href = "/auth/login";
        } catch (err) {
            setProfileFeedback(err instanceof Error ? err.message : "Déconnexion impossible.");
            setSigningOut(false);
        }
    }

    async function handleDeleteAccount() {
        if (!deletePwd.trim()) { setDeleteFeedback("Veuillez saisir votre mot de passe pour confirmer."); return; }

        try {
            setDeletingAccount(true);
            setDeleteFeedback(null);
            await verifyCurrentPassword(supabase, authEmail || email, deletePwd);
            const result = await deleteCurrentUserAccountAction();
            if (!result.success) { setDeleteFeedback(result.message); return; }
            try { await signOutCurrentUser(supabase); } catch {}
            window.location.href = "/auth/login?deleted=1";
        } catch (err) {
            setDeleteFeedback(err instanceof Error ? err.message : "Impossible de supprimer votre compte.");
        } finally {
            setDeletingAccount(false);
        }
    }

    return {
        nom, setNom, prenom, setPrenom, email, setEmail,
        tel, setTel, adresse, setAdresse, bio, setBio,
        filiere, setFiliere, niveau, setNiveau,
        oldPwd, setOldPwd, newPwd, setNewPwd, confPwd, setConfPwd,
        deletePwd, setDeletePwd,
        savingProfile, updatingPassword, signingOut, deletingAccount,
        profileFeedback, passwordFeedback, deleteFeedback,
        handleSaveProfile, handleUpdatePassword, handleSignOut, handleDeleteAccount,
    };
}