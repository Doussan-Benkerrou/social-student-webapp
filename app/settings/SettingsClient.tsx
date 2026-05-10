"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { validateProfileInput } from "@/lib/validations/profile"
import { validatePasswordUpdate } from "@/lib/validations/password"
import BlockedUsersList from "@/components/block/BlockedUsersList"
import type { UserProfile, UserProfileUpdate } from "@/lib/types"
import {
    updateAuthenticatedUserEmail,
    updateAuthenticatedUserPassword,
    verifyCurrentPassword,
    signOutCurrentUser,
} from "@/services/authClientService";
import { deleteCurrentUserAccountAction, updateCurrentUserProfileAction } from "@/app/settings/actions";
import {
    KeyRound,
    Trash2,
    User,
    Eye,
    EyeOff,
    Save,
    Sparkles,
    Loader2,
    LogOut,
    Shield
} from "lucide-react";

type SettingsClientProps = {
    initialProfile: UserProfile;
    initialAuthEmail: string;
};

export default function SettingsClient({
    initialProfile,
    initialAuthEmail,
}: SettingsClientProps) {
    const supabase = useMemo(() => createClient(), []);
    const [loadingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeletePwd, setShowDeletePwd] = useState(false);
    const [showBlockList, setShowBlockList] = useState(false);
    const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
    const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
    const profileError: string | null = null;
    const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);

    const [nom, setNom] = useState(initialProfile.nom ?? "");
    const [prenom, setPrenom] = useState(initialProfile.prenom ?? "");
    const [email, setEmail] = useState(initialProfile.email_univer ?? "");
    const [tel, setTel] = useState(initialProfile.numero_tel ?? "");
    const [adresse, setAdresse] = useState(initialProfile.adresse ?? "");
    const [bio, setBio] = useState(initialProfile.bio ?? "");
    const [filiere, setFiliere] = useState(initialProfile.filiere ?? "");
    const [niveau, setNiveau] = useState(initialProfile.niveau_etude ?? "");
    const [authEmail, setAuthEmail] = useState(initialAuthEmail || initialProfile.email_univer || "");
    const [oldPwd, setOldPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confPwd, setConfPwd] = useState("");
    const [deletePwd, setDeletePwd] = useState("");

    async function handleSaveProfile() {
        const payload: UserProfileUpdate = {
            nom,
            prenom,
            email_univer: email,
            numero_tel: tel,
            adresse,
            bio,
            filiere,
            niveau_etude: niveau,
        };

        const validationError = validateProfileInput(payload);
        if (validationError) {
            setProfileFeedback(validationError);
            return;
        }

        try {
            setSavingProfile(true);
            setProfileFeedback(null);
            let emailMessage = "";
            if (authEmail && email !== authEmail) {
                const updatedAuthUser = await updateAuthenticatedUserEmail(supabase, email);
                emailMessage = " Vérifiez votre boîte mail si Supabase demande une confirmation d’email.";
                setAuthEmail(updatedAuthUser?.email ?? authEmail);
            }

            const result = await updateCurrentUserProfileAction(payload);
            if (!result.success) {
                setProfileFeedback(result.message || "Impossible d'enregistrer les modifications.");
                return;
            }

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
            const message = typeof err === "object" && err && "message" in err
                ? String((err as { message?: unknown }).message ?? "")
                : "";
            setProfileFeedback(message || "Impossible d'enregistrer les modifications.");
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleUpdatePassword() {
        const validationError = validatePasswordUpdate(newPwd, confPwd, oldPwd);
        if (validationError) {
            setPasswordFeedback(validationError);
            return;
        }

        try {
            setUpdatingPassword(true);
            setPasswordFeedback(null);
            await verifyCurrentPassword(supabase, authEmail || email, oldPwd);
            await updateAuthenticatedUserPassword(supabase, newPwd);
            setPasswordFeedback("Mot de passe mis à jour avec succès.");
            setOldPwd("");
            setNewPwd("");
            setConfPwd("");
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
        if (!deletePwd.trim()) {
            setDeleteFeedback("Veuillez saisir votre mot de passe actuel pour confirmer la suppression.");
            return;
        }

        try {
            setDeletingAccount(true);
            setDeleteFeedback(null);
            await verifyCurrentPassword(supabase, authEmail || email, deletePwd);
            const result = await deleteCurrentUserAccountAction();
            if (!result.success) {
                setDeleteFeedback(result.message);
                return;
            }

            try {
                await signOutCurrentUser(supabase);
            } catch {}

            window.location.href = "/auth/login?deleted=1";
        } catch (err) {
            setDeleteFeedback(err instanceof Error ? err.message : "Impossible de supprimer votre compte.");
        } finally {
            setDeletingAccount(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="font-display font-bold text-2xl text-slate-900">Paramètres</h1>
                <p className="text-sm text-slate-500 font-body mt-1">Gérez votre profil, votre sécurité et votre accès à l'assistant IA.</p>
            </div>

            {profileError && (
                <div className="card border-rose-100 bg-rose-50/70 p-4">
                    <p className="font-display font-semibold text-sm text-rose-700">{profileError}</p>
                </div>
            )}

            <div className="card p-5">
                <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                        <Sparkles size={20} className="text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-slate-900">Assistant IA</h3>
                        <p className="text-sm font-body text-slate-500 mt-1">Discutez avec Gemini ou générez des images depuis l'espace Assistant IA.</p>
                    </div>
                    <Link href="/assistant-ia" className="btn-secondary shrink-0">Ouvrir l’assistant IA</Link>
                </div>
            </div>

            <div className="card p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                        <User size={18} className="text-brand-600" />
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-slate-900">Modifier le profil</h2>
                        <p className="text-sm font-body text-slate-500">Mettez à jour les informations sauvegardées dans Supabase.</p>
                    </div>
                </div>

                {loadingProfile ? (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 flex items-center gap-3 text-slate-600">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-500" /> Chargement du profil...
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Nom</label>
                                <input className="input-field" value={nom} onChange={(e) => setNom(e.target.value)} />
                            </div>
                            <div>
                                <label className="input-label">Prénom</label>
                                <input className="input-field" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                            </div>
                            <div>
                                <label className="input-label">Email universitaire</label>
                                <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label className="input-label">Téléphone</label>
                                <input className="input-field" value={tel} onChange={(e) => setTel(e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="input-label">Adresse</label>
                                <input className="input-field" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
                            </div>
                            <div>
                                <label className="input-label">Filière</label>
                                <input className="input-field" value={filiere} onChange={(e) => setFiliere(e.target.value)} />
                            </div>
                            <div>
                                <label className="input-label">Niveau d'étude</label>
                                <input className="input-field" value={niveau} onChange={(e) => setNiveau(e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="input-label">Bio</label>
                                <textarea className="input-field min-h-28 resize-none" value={bio} onChange={(e) => setBio(e.target.value)} />
                            </div>
                        </div>

                        {profileFeedback && (
                            <div className={`rounded-2xl px-4 py-3 ${profileFeedback.includes("succès") ? "border border-emerald-100 bg-emerald-50 text-emerald-700" : "border border-rose-100 bg-rose-50 text-rose-700"}`}>
                                <p className="text-sm font-display font-semibold">{profileFeedback}</p>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary">
                                {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Enregistrer le profil
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="card p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                        <KeyRound size={18} className="text-brand-600" />
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-slate-900">Changer le mot de passe</h2>
                        <p className="text-sm font-body text-slate-500">Cette action met à jour votre mot de passe dans Supabase Auth.</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    <div>
                        <label className="input-label">Mot de passe actuel</label>
                        <div className="relative">
                            <input className="input-field pr-11" type={showCurrentPwd ? "text" : "password"} value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} />
                            <button type="button" onClick={() => setShowCurrentPwd((v) => !v)} className="btn-icon absolute right-2 top-1/2 -translate-y-1/2">
                                {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Nouveau mot de passe</label>
                        <div className="relative">
                            <input className="input-field pr-11" type={showNewPwd ? "text" : "password"} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
                            <button type="button" onClick={() => setShowNewPwd((v) => !v)} className="btn-icon absolute right-2 top-1/2 -translate-y-1/2">
                                {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Confirmation du nouveau mot de passe</label>
                        <div className="relative">
                            <input className="input-field pr-11" type={showConfirmPwd ? "text" : "password"} value={confPwd} onChange={(e) => setConfPwd(e.target.value)} />
                            <button type="button" onClick={() => setShowConfirmPwd((v) => !v)} className="btn-icon absolute right-2 top-1/2 -translate-y-1/2">
                                {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {passwordFeedback && (
                    <div className={`rounded-2xl px-4 py-3 ${passwordFeedback.includes("succès") ? "border border-emerald-100 bg-emerald-50 text-emerald-700" : "border border-rose-100 bg-rose-50 text-rose-700"}`}>
                        <p className="text-sm font-display font-semibold">{passwordFeedback}</p>
                    </div>
                )}

                <div className="flex justify-between gap-3 flex-wrap">
                    <button onClick={handleSignOut} disabled={signingOut} className="btn-secondary">
                        {signingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                        Se déconnecter
                    </button>
                    <button onClick={handleUpdatePassword} disabled={updatingPassword} className="btn-primary">
                        {updatingPassword ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Mettre à jour le mot de passe
                    </button>
                </div>
            </div>


            <div className="card p-6 space-y-4">
                <button
                    onClick={() => setShowBlockList((v) => !v)}
                    className="w-full flex items-center justify-between gap-2.5 text-left group"
                >
                    <div className="flex items-center gap-2.5">
                        <Shield size={17} className="text-red-500 shrink-0" />
                        <div>
                            <h2 className="font-display font-semibold text-base text-slate-900">
                                Liste de blocage
                            </h2>
                            <p className="text-xs text-slate-400 font-body mt-0.5">
                                Les utilisateurs bloqués ne peuvent pas vous envoyer de messages ni voir vos publications.
                            </p>
                        </div>
                    </div>
                    <span className={`text-slate-400 transition-transform duration-200 shrink-0 ${showBlockList ? "rotate-180" : ""}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </span>
                </button>

                {showBlockList && (
                    <div className="pt-3 border-t border-slate-100">
                        <BlockedUsersList />
                    </div>
                )}
            </div>

            <div className="card p-6 border border-red-100 bg-red-50/50 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center">
                        <Trash2 size={18} className="text-red-600" />
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-slate-900">Zone dangereuse</h2>
                        <p className="text-sm font-body text-slate-500">Supprime définitivement votre compte et votre profil associé.</p>
                    </div>
                </div>

                {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger">
                        <Trash2 size={16} /> Supprimer mon compte
                    </button>
                ) : (
                    <div className="space-y-4 rounded-2xl border border-red-200 bg-white p-4">
                        <div>
                            <label className="input-label">Confirmez avec votre mot de passe actuel</label>
                            <div className="relative">
                                <input className="input-field pr-11" type={showDeletePwd ? "text" : "password"} value={deletePwd} onChange={(e) => setDeletePwd(e.target.value)} />
                                <button type="button" onClick={() => setShowDeletePwd((v) => !v)} className="btn-icon absolute right-2 top-1/2 -translate-y-1/2">
                                    {showDeletePwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {deleteFeedback && (
                            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                                <p className="text-sm font-display font-semibold text-rose-700">{deleteFeedback}</p>
                            </div>
                        )}

                        <div className="flex gap-3 flex-wrap">
                            <button onClick={() => { setShowDeleteConfirm(false); setDeleteFeedback(null); setDeletePwd(""); }} className="btn-secondary">Annuler</button>
                            <button onClick={handleDeleteAccount} disabled={deletingAccount} className="btn-danger">
                                {deletingAccount ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                Confirmer la suppression
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}