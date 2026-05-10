"use client";

import {useState, useMemo, useRef } from "react";
import { useToast } from "./UseToast";

import {
    deletePublicationMedia,
    editPublication,
    createPublication
} from "@/services/PublicationService";

import { createPublicationUser, editPublicationUser } from "@/services/dashboardService";
import { getSafeInitials, getSafeText } from "@/lib/utils";
import type { CategorieItem, MediaItem, PublicationItem, ResponseType } from "@/lib/types";




// function patchPublication(
//     prev: PublicationItem[],
//     id_publication: number,
//     patch: Partial<PublicationItem>
// ): PublicationItem[] {
//     return prev.map((p) =>
//         p.id_publication === id_publication ? { ...p, ...patch } : p
//     );
// }




function getInitialCategory(categories: CategorieItem[], pub?: PublicationItem) {
    if (pub?.categorie)
        return categories.find((c) => c.id_categorie === pub.categorie.id_categorie) ?? categories[0] ?? null;
    return categories[0] ?? null;
}

interface UseCreatePublicationOptions {
    categories: ResponseType;
    curUser: ResponseType;
    publicationToEdit?: PublicationItem;
    groupId?: number; 
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function useCreatePublication({
    categories,
    curUser,
    publicationToEdit,
    groupId,
    onSuccess,
    onCancel,
}: UseCreatePublicationOptions) {
    const { toasts, showToast, hideToast } = useToast();
    const isEditMode      = Boolean(publicationToEdit);
    const categoriesData  = Array.isArray(categories.data) ? (categories.data as CategorieItem[]) : [];
    const currentUser     = curUser.success ? curUser.data : null;

    const [open, setOpen]           = useState(isEditMode);
    const [contenu, setContenu]     = useState(publicationToEdit?.contenu ?? "");
    const [isAnonyme, setIsAnonyme] = useState(publicationToEdit?.est_anonyme ?? false);
    const [selectedCategorie, setSelectedCategorie] = useState<CategorieItem | null>(
        () => getInitialCategory(categoriesData, publicationToEdit)
    );
    const [showCatDrop, setShowCatDrop] = useState(false);
    const [submitting, setSubmitting]   = useState(false);
    const [existingMedias, setExistingMedias] = useState<MediaItem[]>(publicationToEdit?.medias ?? []);
    const [newFiles, setNewFiles]       = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentUserInitials = useMemo(() => getSafeInitials(currentUser?.prenom, currentUser?.nom), [currentUser]);
    const currentUserName     = useMemo(() => `${getSafeText(currentUser?.prenom)} ${getSafeText(currentUser?.nom)}`.trim(), [currentUser]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setNewFiles((prev) => [...prev, ...files]);
        files.forEach((file) => setNewPreviews((prev) => [...prev, URL.createObjectURL(file)]));
        e.target.value = "";
    };

    const removeNewFile = (index: number) => {
        URL.revokeObjectURL(newPreviews[index]);
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
        setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingMedia = async (media: MediaItem) => {
        const res = await deletePublicationMedia(media.id_media);
        if (!res.success) { showToast(res.message ?? "Erreur lors de la suppression du média.", "error"); return; }
        setExistingMedias((prev) => prev.filter((m) => m.id_media !== media.id_media));
    };

    const resetForm = () => {
        setContenu(""); setIsAnonyme(false);
        setNewFiles([]); setNewPreviews([]);
        setSelectedCategorie(getInitialCategory(categoriesData));
        setOpen(false);
    };

    const handleSubmit = async () => {
        if (!contenu.trim()) { showToast("Le contenu de la publication est obligatoire.", "error"); return; }
        if (!selectedCategorie) { showToast("Veuillez sélectionner une catégorie.", "error"); return; }

        setSubmitting(true);
        const payload = {
            contenu,
            isAnonyme,
            categorieType: String(selectedCategorie.id_categorie),
            pictures: newFiles.length > 0 ? newFiles : null,
        };

        let res;
        if (groupId !== undefined) {
            // Publication de groupe
            res = isEditMode
                ? await editPublication(publicationToEdit!.id_publication, { ...payload, groupId })
                : await createPublication({ ...payload, groupId });
        } else {
            // Publication dashboard
            res = isEditMode
                ? await editPublicationUser(publicationToEdit!.id_publication, payload)
                : await createPublicationUser(payload);
        }

        setSubmitting(false);
        if (!res.success) { showToast(res.message ?? "Erreur lors de l'enregistrement.", "error"); return; }

        showToast(isEditMode ? "Publication modifiée avec succès." : "Publication créée avec succès.", "success");
        if (isEditMode) { onSuccess?.(); return; }
        resetForm();
        onSuccess?.();
    };

    const handleCancel = () => { isEditMode ? onCancel?.() : resetForm(); };

    return {
        open, setOpen, isEditMode,
        contenu, setContenu,
        isAnonyme, setIsAnonyme,
        selectedCategorie, setSelectedCategorie,
        showCatDrop, setShowCatDrop,
        submitting, existingMedias, newFiles, newPreviews,
        fileInputRef, categoriesData,
        currentUserInitials, currentUserName, currentUser,
        handleFileChange, removeNewFile, removeExistingMedia,
        handleSubmit, handleCancel,
        toasts, showToast, hideToast,
    };
}