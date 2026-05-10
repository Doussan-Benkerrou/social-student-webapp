"use client";

import React from "react";
import Link from "next/link";
import { Send, XCircle, CornerDownRight, UserCircle2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Toast from "@/components/ui/Toast";
import { useCommentaires } from "@/hooks/useCommentaire";
import { getSafeInitials, formatDate } from "@/lib/utils";
import type { CommentaireItem as CommentaireType, ResponseType } from "@/lib/types";

type Props = {
    publication_id: number;
    isAnonymousPost?: boolean;
    canComment?: boolean;
    curUser?: ResponseType;
};

export default function CommentaireModal({
    publication_id, isAnonymousPost = false, canComment = true, curUser,
}: Props) {
    const {
        loadError, commentaires,
        newComment, setNewComment,
        replyTo, inputRef,
        toast, hideToast,
        handleReply, cancelReply, handleEnvoyer, handleSupprimer, handleKeyDown,
    } = useCommentaires(publication_id, isAnonymousPost);

    const curUserData     = curUser?.success ? curUser.data : null;
    const curUserInitials = curUserData ? getSafeInitials(curUserData.prenom, curUserData.nom) : "?";
    const curUserPhoto: string | null = curUserData?.photo_profile ?? null;

    if (loadError) {
        return (
            <div className="flex items-center justify-center min-h-[40px] border-t border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm font-body text-red-700">{loadError}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
            <div className="border-t border-slate-100 px-5 pb-4 pt-3 animate-slide-up">
                {commentaires.length > 0 ? (
                    <div className="mb-3 space-y-3">
                        {commentaires.map((c) => (
                            <CommentaireItem
                                key={c.id_commentaire}
                                commentaire={c}
                                onReply={handleReply}
                                onDelete={handleSupprimer}
                                depth={0}
                                isAnonymousPost={isAnonymousPost}
                                canComment={canComment}
                                currentUserId={curUser?.success ? curUser.data?.id_utilisateur : undefined}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-6 text-center">
                        <p className="text-slate-400 font-body text-sm">Aucun commentaire pour l&apos;instant.</p>
                    </div>
                )}

                {canComment && (
                    <>
                        {replyTo && (
                            <div className="flex items-center gap-2 px-3 py-1.5 mb-2 bg-brand-50 rounded-lg border border-brand-100">
                                <CornerDownRight size={13} className="text-brand-500 shrink-0" />
                                <span className="text-xs text-brand-700 font-display flex-1">
                                    Réponse à <span className="font-semibold">{replyTo.auteurPrenom}</span>
                                </span>
                                <button onClick={cancelReply} className="text-brand-500 hover:text-brand-700 transition-colors">
                                    <XCircle size={14} />
                                </button>
                            </div>
                        )}

                        <div className="flex gap-3 items-center">
                            <Avatar size="xs" color="from-brand-400 to-brand-700" initials={curUserInitials} src={curUserPhoto} />
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={replyTo ? `Répondre à ${replyTo.auteurPrenom}…` : "Écrire un commentaire…"}
                                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white transition-all"
                                />
                                {newComment.trim() !== "" && (
                                    <button type="button" onClick={handleEnvoyer} className="absolute right-2 top-1/2 -translate-y-1/2 btn-icon w-7 h-7 text-brand-600">
                                        <Send size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function CommentaireItem({
    commentaire, onReply, onDelete, depth, isAnonymousPost, canComment, currentUserId,
}: {
    commentaire: CommentaireType;
    onReply: (c: CommentaireType) => void;
    onDelete: (id: number) => void;
    depth: number;
    isAnonymousPost: boolean;
    canComment: boolean;
    currentUserId?: number;
}) {
    const auteur   = commentaire.auteur;
    const initials = auteur ? (`${auteur.prenom?.[0] ?? ""}${auteur.nom?.[0] ?? ""}` || "?") : "?";
    const isOwner  = commentaire.auteur?.id_utilisateur === currentUserId;

    return (
        <div className={depth > 0 ? "ml-9 mt-2" : ""}>
            <div className="flex gap-3">
                {isAnonymousPost || !auteur ? (
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <UserCircle2 className="w-4 h-4 text-slate-400" />
                    </div>
                ) : (
                    <Link href={`/profile/${auteur.id_utilisateur}`} className="shrink-0">
                        <Avatar src={auteur.photo_profile} initials={initials} color="from-sky-400 to-blue-600" size="xs" />
                    </Link>
                )}

                <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2.5">
                    {isAnonymousPost || !auteur ? (
                        <p className="font-display font-semibold text-xs text-slate-700 mb-0.5">Anonyme</p>
                    ) : (
                        <Link href={`/profile/${auteur.id_utilisateur}`} className="font-display font-semibold text-xs text-slate-700 mb-0.5 hover:text-brand-700 transition-colors">
                            {auteur.prenom} {auteur.nom}
                        </Link>
                    )}
                    <p className="text-sm text-slate-600 font-body">{commentaire.contenu_com}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                        {depth === 0 && canComment && (
                            <button onClick={() => onReply(commentaire)} className="text-[11px] text-slate-400 hover:text-brand-600 transition-colors font-display">
                                Répondre
                            </button>
                        )}
                        {isOwner && (
                            <button onClick={() => onDelete(commentaire.id_commentaire)} className="text-[11px] text-red-400 hover:text-red-600 transition-colors font-display">
                                Supprimer
                            </button>
                        )}
                        <span className="text-[11px] text-slate-300">{formatDate(commentaire.date_com)}</span>
                    </div>
                </div>
            </div>

            {commentaire.reponses && commentaire.reponses.length > 0 && (
                <div className="mt-2 space-y-2">
                    {commentaire.reponses.map((rep) => (
                        <CommentaireItem key={rep.id_commentaire} commentaire={rep} onReply={onReply} depth={depth + 1} isAnonymousPost={isAnonymousPost} canComment={canComment} onDelete={onDelete} currentUserId={currentUserId} />
                    ))}
                </div>
            )}
        </div>
    );
}