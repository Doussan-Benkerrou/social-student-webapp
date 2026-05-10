"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    reactionPublication,
    removeReactionPublication,
    signalisationPublication,
    getSignalisationByPublication,
    updateSignalisationPublication,
} from "@/services/reactionService";
import {
    favorisPublication,
    removeFavorisPublication,
    deletePublication,
} from "@/services/PublicationService";
import { SignaleEditInput, signaleEditSchema } from "@/lib/validations/publicationSchema";
import { useToast } from "./UseToast";
import type { PublicationItem } from "@/lib/types";

export function usePublicationCard(
    publication: PublicationItem,
    onDelete?: (id: number) => void,
    onUpdate?: () => void,
    readOnly = false
) {
    const { toasts, showToast, hideToast } = useToast();

    const [liked, setLiked]               = useState(publication.a_reagir);
    const [fav, setFav]                   = useState(publication.a_favoris);
    const [likesCount, setLikesCount]     = useState(publication.nombre_reactions);
    const [commentsCount, setCommentsCount] = useState(publication.nombre_commentaires);
    const [menuOpen, setMenuOpen]         = useState(false);
    const [showReport, setShowReport]     = useState(false);
    const [showShare, setShowShare]       = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [hasSignal, setHasSignal]       = useState(Boolean(publication.signalisations?.motif_signale));
    const [reportReason, setReportReason] = useState(publication.signalisations?.motif_signale ?? "");

    const { register, handleSubmit, reset, formState: { errors } } = useForm<SignaleEditInput>({
        resolver: zodResolver(signaleEditSchema),
        mode: "onChange",
    });


    useEffect(() => {
        setLiked(publication.a_reagir);
        setFav(publication.a_favoris);
        setLikesCount(publication.nombre_reactions);
        setCommentsCount(publication.nombre_commentaires);
        const motif = publication.signalisations?.motif_signale ?? "";
        setHasSignal(Boolean(motif));
        setReportReason(motif);
        reset({ contenu: motif });
    }, [
        publication.a_reagir,
        publication.a_favoris,
        publication.nombre_reactions,
        publication.nombre_commentaires,
        publication.signalisations?.motif_signale,
        reset,
    ]);

    const handleLike = useCallback(async () => {
        if (readOnly) return;
        const nextLiked = !liked;
        const nextCount = nextLiked ? likesCount + 1 : likesCount - 1;
        setLiked(nextLiked);
        setLikesCount(nextCount);
        const res = nextLiked
            ? await reactionPublication(publication.id_publication)
            : await removeReactionPublication(publication.id_publication);
        if (!res.success) {
            setLiked(!nextLiked);
            setLikesCount(likesCount);
            showToast(res.message ?? "Erreur lors de la mise à jour de la réaction.", "error");
        }
    }, [liked, likesCount, publication.id_publication, readOnly, showToast]);

    const handleFavoris = useCallback(async () => {
        if (readOnly) return;
        const nextFav = !fav;
        setFav(nextFav);
        const res = nextFav
            ? await favorisPublication(publication.id_publication)
            : await removeFavorisPublication(publication.id_publication);
        if (!res.success) {
            setFav(!nextFav);
            showToast(res.message ?? "Erreur lors de la mise à jour des favoris.", "error");
        }
    }, [fav, publication.id_publication, readOnly, showToast]);

    const handleSignaleSubmit = useCallback(async (data: SignaleEditInput) => {
        const existingSignal = await getSignalisationByPublication(publication.id_publication);
        if (!existingSignal.success) {
            showToast(existingSignal.message ?? "Erreur.", "error");
            return;
        }
        const isExisting = Boolean(existingSignal.data);
        const res = isExisting
            ? await updateSignalisationPublication(publication.id_publication, data.contenu)
            : await signalisationPublication(publication.id_publication, data.contenu);
        if (!res.success) { showToast(res.message ?? "Erreur lors du signalement.", "error"); return; }
        setHasSignal(true);
        setReportReason(data.contenu);
        reset({ contenu: data.contenu });
        showToast(isExisting ? "Signalement mis à jour." : "Publication signalée avec succès.", "success");
        setShowReport(false);
    }, [publication.id_publication, reset, showToast]);

    const handleDeletePublication = useCallback(async () => {
        setMenuOpen(false);
        const res = await deletePublication(publication.id_publication);
        if (!res.success) { showToast(res.message ?? "Erreur lors de la suppression.", "error"); return; }
        onDelete?.(publication.id_publication);
    }, [publication.id_publication, onDelete, showToast]);

    const handleShare = useCallback(async () => {
        const url = `${window.location.origin}/publication/${publication.id_publication}`;
        try {
            await navigator.clipboard.writeText(url);
            showToast("Lien copié dans le presse-papiers !", "success");
        } catch {
            showToast("Impossible de copier le lien.", "error");
        }
        setShowShare(false);
    }, [publication.id_publication, showToast]);

    return {
        liked, fav, likesCount, commentsCount,
        menuOpen, setMenuOpen,
        showReport, setShowReport,
        showShare, setShowShare,
        showComments, setShowComments,
        showEditModal, setShowEditModal,
        hasSignal, reportReason,
        register, handleSubmit, errors, reset,
        handleLike, handleFavoris, handleSignaleSubmit,
        handleDeletePublication, handleShare,
        toasts, showToast, hideToast,
    };
}