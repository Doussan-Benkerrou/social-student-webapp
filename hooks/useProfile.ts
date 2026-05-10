"use client";
import useUser from "./useUser";
import { getProfileById } from "@/services/ProfileService";
import { getPublicationsUserById } from "@/services/dashboardService";
import { checkBlockStatus } from "@/services/blocageService";
import { useToast } from "./UseToast";
import { useState, useTransition, useRef, useCallback, useEffect } from "react";
import { updateProfile, updateProfilePhoto, removeProfilePhoto, getCurrentAuthId } from "@/services/ProfileService";
import { uploadAvatar, deleteAvatar } from "@/services/avatarService";
import type { ResponseType } from "@/lib/types";


export function useProfile() {
  const { user, loading } = useUser();
  return { profile: user, loading };
}



export function useProfileDetail(userId: number, currentUserId: number) {
    const [user, setUser]               = useState<any>(null);
    const [publications, setPublications] = useState<any[]>([]);
    const [loading, setLoading]         = useState(true);
    const [theyBlockedMe, setTheyBlockedMe] = useState(false);

    const { toasts, showToast, hideToast } = useToast();

    useEffect(() => {
        let cancelled = false;

        const fetchAll = async () => {
            setLoading(true);
            const [profileResult, pubsResult, blockStatus] = await Promise.all([
                getProfileById(userId),
                getPublicationsUserById(userId, 1, 20),
                checkBlockStatus(currentUserId, userId),
            ]);

            if (cancelled) return;

            if (!profileResult.success) {
                showToast("Erreur lors de la récupération de l'utilisateur.", "error");
            } else {
                setUser(profileResult.data);
            }

            if (pubsResult.success) setPublications(pubsResult.data ?? []);
            setTheyBlockedMe(blockStatus.theyBlockedMe);
            setLoading(false);
        };

        fetchAll();
        return () => { cancelled = true; };
    }, [userId, currentUserId, showToast]);

    const refreshProfile = useCallback(async () => {
        const profileResult = await getProfileById(userId);
        if (profileResult.success) setUser(profileResult.data);
    }, [userId]);

    return {
        user, publications, loading,
        theyBlockedMe,
        refreshProfile,
        toasts, showToast, hideToast,
    };
}



export type UploadState = "idle" | "compressing" | "uploading" | "done" | "error";

export function useProfileEditor(
    profile: ResponseType,
    onSaved?: (newPhotoUrl: string | null) => void,
    onCancel?: () => void
) {
    const [bio, setBio]       = useState(profile.data?.bio ?? "");
    const [filiere, setFiliere] = useState(profile.data?.filiere ?? "");
    const [niveau, setNiveau]   = useState(profile.data?.niveau_etude ?? "");

    const [previewUrl, setPreviewUrl]     = useState<string | null>(profile.data?.photo_profile ?? null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadState, setUploadState]   = useState<UploadState>("idle");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError]   = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPending, startTransition] = useTransition();

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        setUploadState("idle");
        setPendingDelete(false);

        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowed.includes(file.type)) { setUploadError("Format non supporté (JPG, PNG, WebP)."); return; }
        if (file.size > 5 * 1024 * 1024) { setUploadError("La photo doit faire moins de 5 Mo."); return; }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }, []);

    const handleRemovePhoto = useCallback(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setPendingDelete(true);
        setUploadError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const handleCancel = useCallback(() => { onCancel?.(); }, [onCancel]);

    const handleSave = () => {
        startTransition(async () => {
            setUploadError(null);
            let newPhotoUrl: string | undefined | null = undefined;

            if (selectedFile) {
                setUploadState("compressing");
                setUploadProgress(10);
                const authId = await getCurrentAuthId();
                if (!authId) { setUploadError("Impossible d'identifier votre session."); setUploadState("error"); return; }

                setUploadState("uploading");
                const result = await uploadAvatar(selectedFile, authId, (pct) => setUploadProgress(pct));

                if (!result.success) {
                    setUploadError(result.error);
                    setUploadState("error");
                    setPreviewUrl(profile.data?.photo_profile ?? null);
                    return;
                }

                const dbRes = await updateProfilePhoto(result.publicUrl);
                if (!dbRes.success) { setUploadError("Photo uploadée mais erreur de mise à jour."); setUploadState("error"); return; }
                setUploadState("done");
                newPhotoUrl = result.publicUrl;
            }

            if (pendingDelete && !selectedFile) {
                const authId = await getCurrentAuthId();
                if (authId) await deleteAvatar(authId);
                const dbRes = await removeProfilePhoto();
                if (!dbRes.success) { setUploadError("Erreur lors de la suppression de la photo."); return; }
                newPhotoUrl = null;
            }

            const res = await updateProfile({
                bio, filiere, niveau_etude: niveau,
                ...(newPhotoUrl !== undefined ? { photo_profile: newPhotoUrl ?? undefined } : {}),
            });

            if (res.success) {
                onSaved?.(newPhotoUrl !== undefined ? newPhotoUrl : (profile.data?.photo_profile ?? null));
            } else {
                setUploadError("Erreur lors de la mise à jour du profil.");
            }
        });
    };

    const isWorking = isPending || uploadState === "uploading" || uploadState === "compressing";

    return {
        bio, setBio, filiere, setFiliere, niveau, setNiveau,
        previewUrl, selectedFile, uploadState, uploadProgress, uploadError,
        fileInputRef, isPending, isWorking,
        handleFileChange, handleRemovePhoto, handleCancel, handleSave,
    };
}