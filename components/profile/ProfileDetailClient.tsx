"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import AppLayout from "@/components/layout/AppLayout";
import Avatar from "@/components/ui/Avatar";
import ToastStack from "@/components/ui/ToastStack";
import ProfileEditor from "./ProfileEditor";
import BlockButton from "@/components/block/BlockButton";
import { MessageButton } from "@/components/messages/MessageButton";
import { UserX, BookOpen, GraduationCap, Edit2, Loader2 } from "lucide-react";
import { getSafeInitials, getSafeText } from "@/lib/utils";
import { useProfileDetail } from "@/hooks/useProfile";
import { useBlockList } from "@/hooks/useBlockList";
import type { ResponseType } from "@/lib/types";

type Props = {
    userId: number;
    curUser: ResponseType;
};

export default function ProfileDetailClient({ userId, curUser }: Props) {
    const currentUserId  = curUser.data?.id_utilisateur as number;
    const isCurrentUser  = Number(currentUserId) === Number(userId);
    const [isEditing, setIsEditing] = useState(false);

    const {
        user, publications, loading,
        theyBlockedMe,
        refreshProfile,
        toasts, hideToast,
    } = useProfileDetail(userId, currentUserId);


    const { isUserBlocked } = useBlockList();
    const iBlockedThem = isUserBlocked(userId);

    const handleSaveSuccess = useCallback(async () => {
        await refreshProfile();
        setIsEditing(false);
    }, [refreshProfile]);

    if (loading) {
        return (
            <AppLayout curUser={curUser}>
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-slate-300" />
                </div>
            </AppLayout>
        );
    }

    if (!user) {
        return (
            <AppLayout curUser={curUser}>
                <div className="card p-10 text-center max-w-3xl mx-auto mt-10">
                    <p className="text-slate-400 font-body text-sm">Utilisateur introuvable.</p>
                </div>
            </AppLayout>
        );
    }

    if (theyBlockedMe) {
        return (
            <AppLayout curUser={curUser}>
                <div className="card p-10 text-center max-w-3xl mx-auto mt-10">
                    <p className="text-slate-400 font-body text-sm">Ce profil n'est pas disponible.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout curUser={curUser}>
            <ToastStack toasts={toasts} onClose={hideToast} />
            <div className="max-w-3xl mx-auto p-6 space-y-5">

                {isCurrentUser && isEditing ? (
                    <div className="card p-6">
                        <div className="mb-4 pb-3 border-b border-slate-100">
                            <h2 className="font-display font-bold text-xl text-slate-900">Modifier mon profil</h2>
                            <p className="text-sm text-slate-500 font-body mt-0.5">Modifiez vos informations personnelles</p>
                        </div>
                        <ProfileEditor
                            profile={curUser}
                            onSaved={handleSaveSuccess}
                            onCancel={() => setIsEditing(false)}
                        />
                    </div>
                ) : (
                    <>
                        <div className="card overflow-hidden">
                            <div className="h-36 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 relative">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                            </div>

                            <div className="px-6 pb-6">
                                <div className="flex items-end justify-between -mt-10 mb-5">
                                    <Avatar initials={getSafeInitials(user.prenom, user.nom)} src={user.photo_profile ?? null} size="xl" color="from-brand-400 to-brand-700" />
                                    {isCurrentUser ? (
                                        <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
                                            <Edit2 size={15} /> Modifier
                                        </button>
                                    ) : (
                                        <div className="flex gap-2 items-center">
                                            {!iBlockedThem && (
                                                <MessageButton currentUserId={currentUserId} profileUserId={user.id_utilisateur} content="Message" />
                                            )}
                                            <BlockButton targetUserId={user.id_utilisateur} />
                                        </div>
                                    )}
                                </div>

                                <h1 className="font-display font-bold text-2xl text-slate-900">
                                    {getSafeText(user.prenom)} {getSafeText(user.nom)}
                                </h1>

                                {iBlockedThem && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 text-xs font-body rounded-full border border-red-100">
                                        <UserX size={12} /> Vous avez bloqué cet utilisateur
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-4 mt-3">
                                    <span className="flex items-center gap-1.5 text-sm text-slate-500 font-body">
                                        <BookOpen size={14} className="text-brand-500" /> {getSafeText(user.filiere, "—")}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm text-slate-500 font-body">
                                        <GraduationCap size={14} className="text-brand-500" /> {getSafeText(user.niveau_etude, "—")}
                                    </span>
                                </div>

                                {user.bio && (
                                    <p className="mt-4 text-sm text-slate-600 font-body leading-relaxed">{user.bio}</p>
                                )}
                            </div>
                        </div>

                        {!iBlockedThem && (
                            <div className="space-y-4">
                                <h2 className="font-display font-semibold text-slate-700 text-sm px-1">Publications</h2>
                                {publications.length > 0 ? (
                                    publications.map((p: any) => (
                                        <div key={p.id_publication} className="card p-5">
                                            <div className="flex items-start gap-3 mb-3">
                                                {p.est_anonyme ? (
                                                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
                                                        <span className="text-slate-400 text-xs font-bold">?</span>
                                                    </div>
                                                ) : (
                                                    <Avatar initials={getSafeInitials(user.prenom, user.nom)} src={user.photo_profile ?? null} size="sm" color="from-brand-400 to-brand-700" />
                                                )}
                                                <div>
                                                    <p className="font-display font-semibold text-sm text-slate-800">
                                                        {p.est_anonyme ? "Anonyme" : `${getSafeText(user.prenom)} ${getSafeText(user.nom)}`}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-body">
                                                        {new Date(p.date_publication).toLocaleDateString("fr-FR")}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-700 font-body">{p.contenu}</p>
                                            {p.medias?.length > 0 && (
                                                <div className="mt-3 flex gap-2 flex-wrap">
                                                    {p.medias.map((m: any) => (
                                                        <div key={m.id_media} className="relative max-h-48 overflow-hidden rounded-xl">
                                                            <Image src={m.url_media} alt="" width={400} height={192} className="rounded-xl object-cover max-h-48 w-auto" loading="lazy" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="card p-10 text-center">
                                        <p className="text-slate-400 font-body text-sm">Aucune publication pour le moment.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}