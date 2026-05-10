"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
    Heart, MessageCircle, Share2, Bookmark, BookmarkCheck,
    Flag, MoreHorizontal, UserCircle2, Users, Edit2, Trash2, X, XCircle, Link2,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import ToastStack from "@/components/ui/ToastStack";
import CommentaireModal from "./CommentaireModal";
import CreatePublicationUser from "./CreatePublicationUser";
import { usePublicationCard } from "@/hooks/usePublicationCard";
import { getSafeInitials, getSafeText } from "@/lib/utils";
import type { PublicationItem, ResponseType } from "@/lib/types";

interface PublicationProps {
    publication: PublicationItem;
    curUser: ResponseType;
    categories: ResponseType;
    onDelete?: (id: number) => void;
    onUpdate?: () => void;
}

function areEqual(prev: PublicationProps, next: PublicationProps): boolean {
    const p = prev.publication;
    const n = next.publication;
    return (
        p.id_publication      === n.id_publication      &&
        p.nombre_reactions    === n.nombre_reactions    &&
        p.nombre_commentaires === n.nombre_commentaires &&
        p.a_reagir            === n.a_reagir            &&
        p.a_favoris           === n.a_favoris           &&
        p.contenu             === n.contenu             &&
        p.est_anonyme         === n.est_anonyme         &&
        p.signalisations?.motif_signale === n.signalisations?.motif_signale
    );
}

const PublicationCardUser = React.memo(function PublicationCardUser({
    publication, curUser, categories, onDelete, onUpdate,
}: PublicationProps) {
    const currentUserId = curUser.success ? curUser.data?.id_utilisateur ?? null : null;

    const {
        liked, fav, likesCount, commentsCount,
        menuOpen, setMenuOpen,
        showReport, setShowReport,
        showShare, setShowShare,
        showComments, setShowComments,
        showEditModal, setShowEditModal,
        hasSignal, reportReason,
        register, handleSubmit, errors,
        handleLike, handleFavoris, handleSignaleSubmit,
        handleDeletePublication, handleShare,
        toasts, hideToast,
    } = usePublicationCard(publication, onDelete, onUpdate);

    const isOwner = currentUserId !== null && publication.auteur?.id_utilisateur === currentUserId;

    const auteurInitials = useMemo(
        () => getSafeInitials(publication.auteur?.prenom, publication.auteur?.nom),
        [publication.auteur?.prenom, publication.auteur?.nom]
    );

    return (
        <>
            <ToastStack toasts={toasts} onClose={hideToast} />

            <article className="card animate-slide-up">
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {publication.est_anonyme || !publication.auteur ? (
                                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center">
                                    <UserCircle2 className="w-6 h-6 text-slate-400" />
                                </div>
                            ) : (
                                <Link href={`/profile/${publication.auteur.id_utilisateur}`}>
                                    <Avatar src={publication.auteur.photo_profile ?? null} initials={auteurInitials} size="md" color="from-brand-400 to-brand-700" />
                                </Link>
                            )}
                            <div>
                                {publication.est_anonyme || !publication.auteur ? (
                                    <p className="font-display font-semibold text-sm text-slate-700">Anonyme</p>
                                ) : (
                                    <Link href={`/profile/${publication.auteur.id_utilisateur}`} className="font-display font-semibold text-sm text-slate-800 hover:text-brand-700 transition-colors">
                                        {`${getSafeText(publication.auteur.prenom)} ${getSafeText(publication.auteur.nom)}`.trim()}
                                    </Link>
                                )}
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-slate-400 font-body">{publication.date_publication}</span>
                                    {publication.groupe?.nom_groupe && (
                                        <>
                                            <span className="text-slate-300">·</span>
                                            <span className="flex items-center gap-1 text-[11px] text-brand-600 font-display font-semibold">
                                                <Users size={10} /> {getSafeText(publication.groupe.nom_groupe)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="chip">{getSafeText(publication.categorie?.nom_categorie)}</span>
                            <div className="relative">
                                <button onClick={() => setMenuOpen(!menuOpen)} className="btn-icon">
                                    <MoreHorizontal size={16} />
                                </button>
                                {menuOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-card-hover border border-slate-100 py-1 z-20 animate-fade-in">
                                        {isOwner && (
                                            <>
                                                <button onClick={() => { setShowEditModal(true); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
                                                    <Edit2 size={14} className="text-slate-400" /> Modifier
                                                </button>
                                                <button onClick={handleDeletePublication} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
                                                    <Trash2 size={14} /> Supprimer
                                                </button>
                                                <div className="border-t border-slate-100 my-1" />
                                            </>
                                        )}
                                        {!isOwner && (
                                            <button onClick={() => { setShowReport(true); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
                                                <Flag size={14} className="text-slate-400" />
                                                {hasSignal ? "Modifier le signalement" : "Signaler"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-slate-700 font-body leading-relaxed mb-4">
                        {getSafeText(publication.contenu, "")}
                    </p>

                    {publication.medias && publication.medias.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {publication.medias.map((media) => (
                                media.type_media === "image" ? (
                                    <img key={media.id_media} src={media.url_media} alt="média" loading="lazy" className="rounded-xl object-cover max-h-64 max-w-full border border-slate-100" />
                                ) : (
                                    <video key={media.id_media} src={media.url_media} controls className="rounded-xl max-h-64 max-w-full border border-slate-100" />
                                )
                            ))}
                        </div>
                    )}

                    <div className="border-t border-slate-100 mb-3" />

                    <div className="flex items-center gap-1">
                        <button onClick={handleLike} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-display font-medium transition-all duration-150 ${liked ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}>
                            <Heart size={16} className={liked ? "fill-red-500" : ""} />
                            <span>{likesCount}</span>
                        </button>

                        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-display font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-150">
                            <MessageCircle size={16} />
                            <span>{commentsCount}</span>
                        </button>

                        <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-display font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-150">
                            <Share2 size={16} />
                            <span>Partager</span>
                        </button>

                        <div className="flex-1" />

                        <button onClick={handleFavoris} className={`btn-icon ${fav ? "text-brand-600" : "text-slate-400"}`}>
                            {fav ? <BookmarkCheck size={18} className="fill-brand-100" /> : <Bookmark size={18} />}
                        </button>
                    </div>
                </div>

                {showComments && (
                    <CommentaireModal
                        publication_id={publication.id_publication}
                        isAnonymousPost={publication.est_anonyme}
                        canComment={true}
                        curUser={curUser}
                    />
                )}

                {showReport && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                        <div className="card max-w-sm w-full p-6 animate-slide-up">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-display font-bold text-slate-800">Signaler cette publication</h3>
                                <button onClick={() => setShowReport(false)} className="btn-icon"><X size={16} /></button>
                            </div>
                            <p className="text-sm text-slate-500 font-body mb-4">Décrivez le motif de signalement :</p>
                            <form onSubmit={handleSubmit(handleSignaleSubmit)}>
                                <div className="mb-5">
                                    <textarea rows={4} defaultValue={reportReason} {...register("contenu")} placeholder="Ex : contenu inapproprié, harcèlement…" className="w-full p-3 rounded-xl border border-slate-200 text-sm font-body text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 resize-none transition" />
                                    {errors.contenu && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><XCircle size={12} /> {errors.contenu.message}</p>}
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setShowReport(false)} className="btn-secondary flex-1">Annuler</button>
                                    <button type="submit" className="btn-danger flex-1">Signaler</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showShare && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                        <div className="card max-w-sm w-full p-6 animate-slide-up">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-display font-bold text-slate-800">Partager la publication</h3>
                                <button onClick={() => setShowShare(false)} className="btn-icon"><X size={16} /></button>
                            </div>
                            <button onClick={handleShare} className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50 transition-all text-left">
                                <Link2 size={18} className="text-brand-500" />
                                <span className="font-display font-medium text-sm text-slate-700">Copier le lien</span>
                            </button>
                        </div>
                    </div>
                )}
            </article>

            {showEditModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="w-full max-w-lg animate-slide-up">
                        <CreatePublicationUser
                            publicationToEdit={publication}
                            categories={categories}
                            curUser={curUser}
                            onSuccess={() => { setShowEditModal(false); onUpdate?.(); }}
                            onCancel={() => setShowEditModal(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}, areEqual);

export default PublicationCardUser;