"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
    ajouterCommentaire,
    deleteCommentaire,
    getCommentairesByPublication,
    repondreCommentaire,
} from "@/services/commentService";
import { useToast } from "./UseToast";
import type { CommentaireItem } from "@/lib/types";

function buildCommentTree(flat: CommentaireItem[]): CommentaireItem[] {
    const roots: CommentaireItem[] = [];
    const map = new Map<number, CommentaireItem>();
    flat.forEach((c) => map.set(c.id_commentaire, { ...c, reponses: [] }));
    map.forEach((c) => {
        if (c.id_commentaire_parent) {
            const parent = map.get(c.id_commentaire_parent);
            if (parent) { parent.reponses = [...(parent.reponses ?? []), c]; }
            else { roots.push(c); }
        } else {
            roots.push(c);
        }
    });
    return roots;
}

export function useCommentaires(
    publication_id: number,
    isAnonymousPost: boolean
) {
    const { toast, showToast, hideToast } = useToast();
    const [loadError, setLoadError]       = useState("");
    const [commentaires, setCommentaires] = useState<CommentaireItem[]>([]);
    const [newComment, setNewComment]     = useState("");
    const [replyTo, setReplyTo]           = useState<{ id: number; auteurPrenom: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const loadCommentaires = useCallback(async () => {
        const res = await getCommentairesByPublication(publication_id);
        if (!res.success) { setLoadError(res.message ?? "Erreur lors du chargement des commentaires."); return; }
        setCommentaires(buildCommentTree(res.data ?? []));
    }, [publication_id]);

    useEffect(() => { loadCommentaires(); }, [loadCommentaires]);

    const handleReply = useCallback((commentaire: CommentaireItem) => {
        const displayName = isAnonymousPost ? "Anonyme" : (commentaire.auteur?.prenom ?? "quelqu'un");
        setReplyTo({ id: commentaire.id_commentaire, auteurPrenom: displayName });
        setNewComment("");
        inputRef.current?.focus();
    }, [isAnonymousPost]);

    const cancelReply = useCallback(() => { setReplyTo(null); setNewComment(""); }, []);

    const handleEnvoyer = useCallback(async () => {
        const texte = newComment.trim();
        if (!texte) return;
        const res = replyTo
            ? await repondreCommentaire(publication_id, replyTo.id, texte)
            : await ajouterCommentaire(publication_id, texte);
        if (!res.success) { showToast(res.message ?? "Erreur lors de l'envoi du commentaire.", "error"); return; }
        setNewComment("");
        setReplyTo(null);
        await loadCommentaires();
    }, [newComment, replyTo, publication_id, showToast, loadCommentaires]);

    const handleSupprimer = useCallback(async (commentaireId: number) => {
        const res = await deleteCommentaire(commentaireId);
        if (!res.success) { showToast(res.message ?? "Erreur lors de la suppression.", "error"); return; }
        await loadCommentaires();
    }, [showToast, loadCommentaires]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnvoyer(); }
        if (e.key === "Escape" && replyTo) cancelReply();
    }, [handleEnvoyer, replyTo, cancelReply]);

    return {
        loadError, commentaires,
        newComment, setNewComment,
        replyTo, inputRef,
        toast, hideToast,
        handleReply, cancelReply, handleEnvoyer, handleSupprimer, handleKeyDown,
    };
}