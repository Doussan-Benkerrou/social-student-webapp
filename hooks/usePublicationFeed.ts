"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPublicationsUser } from "@/services/dashboardService";
import { getPublicationsByGroupe } from "@/services/PublicationService";
import { useToast } from "./UseToast";
import type { PublicationItem, ResponseType } from "@/lib/types";


function patchPublication(
    prev: PublicationItem[],
    id_publication: number,
    patch: Partial<PublicationItem>
): PublicationItem[] {
    return prev.map((p) =>
        p.id_publication === id_publication ? { ...p, ...patch } : p
    );
}


export function usePublicationUserFeed(initialResult: ResponseType) {
    const { toasts, showToast, hideToast } = useToast();

    const [publications, setPublications] = useState<PublicationItem[]>(() =>
        Array.isArray(initialResult.data) ? initialResult.data : []
    );

    useEffect(() => {
        if (!initialResult.success && publications.length === 0) {
            showToast(initialResult.message || "Une erreur est survenue.", "error");
        }
    }, [initialResult.success, initialResult.message, publications.length, showToast]);


    const reload = useCallback(async () => {
        const result = await getPublicationsUser();
        if (!result.success) {
            showToast(result.message ?? "Impossible de recharger les publications.", "error");
            setPublications([]);
            return;
        }
        setPublications(result.data ?? []);
    }, [showToast]);

    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel(`realtime-publications-user-${Date.now()}`)

            .on("postgres_changes", { event: "INSERT", schema: "public", table: "reaction" }, (payload) => {
                const id = (payload.new as any)?.id_publication;
                if (!id) return;
                setPublications((prev) =>
                    patchPublication(prev, id, {
                        nombre_reactions: (prev.find((p) => p.id_publication === id)?.nombre_reactions ?? 0) + 1,
                    })
                );
            })
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "reaction" }, (payload) => {
                const id = (payload.old as any)?.id_publication;
                if (!id) return;
                setPublications((prev) =>
                    patchPublication(prev, id, {
                        nombre_reactions: Math.max(0, (prev.find((p) => p.id_publication === id)?.nombre_reactions ?? 1) - 1),
                    })
                );
            })

            .on("postgres_changes", { event: "INSERT", schema: "public", table: "commentaire" }, (payload) => {
                const id = (payload.new as any)?.id_publication;
                if (!id) return;
                setPublications((prev) =>
                    patchPublication(prev, id, {
                        nombre_commentaires: (prev.find((p) => p.id_publication === id)?.nombre_commentaires ?? 0) + 1,
                    })
                );
            })
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "commentaire" }, (payload) => {
                const id = (payload.old as any)?.id_publication;
                if (!id) return;
                setPublications((prev) =>
                    patchPublication(prev, id, {
                        nombre_commentaires: Math.max(0, (prev.find((p) => p.id_publication === id)?.nombre_commentaires ?? 1) - 1),
                    })
                );
            })

            .on("postgres_changes", { event: "INSERT", schema: "public", table: "favoris" }, (payload) => {
                const id = (payload.new as any)?.id_publication;
                if (!id) return;
                setPublications((prev) => patchPublication(prev, id, { a_favoris: true }));
            })
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "favoris" }, (payload) => {
                const id = (payload.old as any)?.id_publication;
                if (!id) return;
                setPublications((prev) => patchPublication(prev, id, { a_favoris: false }));
            })

            .on("postgres_changes", { event: "INSERT", schema: "public", table: "publication" }, async () => reload())
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "publication" }, async () => reload())
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "publication" }, async () => reload())

            .subscribe();

        return () => { channel.unsubscribe(); };
    }, [reload]);

    const removePublication = useCallback((id: number) => {
        setPublications((prev) => prev.filter((p) => p.id_publication !== id));
    }, []);

    return { publications, reload, removePublication, toasts, showToast, hideToast };
}


export function usePublicationGroupFeed(groupId: number, initialResult: ResponseType) {
    const { toasts, showToast, hideToast } = useToast();

    const [publications, setPublications] = useState<PublicationItem[]>(() =>
        Array.isArray(initialResult.data) ? initialResult.data : []
    );

    useEffect(() => {
        if (!initialResult.success && publications.length === 0) {
            showToast(initialResult.message ?? "Impossible de charger les publications.", "error");
        }
    }, [initialResult.success, initialResult.message, publications.length, showToast]);

    const reload = useCallback(async () => {
        const result = await getPublicationsByGroupe(groupId);
        if (!result.success) {
            showToast(result.message ?? "Impossible de recharger les publications.", "error");
            setPublications([]);
            return;
        }
        setPublications(result.data ?? []);
    }, [groupId, showToast]);

    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel(`realtime-publications-group-${groupId}-${Date.now()}`)

            .on("postgres_changes", { event: "INSERT", schema: "public", table: "reaction" }, (payload) => {
                const id = (payload.new as any)?.id_publication;
                if (!id) return;
                setPublications((prev) =>
                    patchPublication(prev, id, {
                        nombre_reactions: (prev.find((p) => p.id_publication === id)?.nombre_reactions ?? 0) + 1,
                    })
                );
            })
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "reaction" }, (payload) => {
                const id = (payload.old as any)?.id_publication;
                if (!id) return;
                setPublications((prev) =>
                    patchPublication(prev, id, {
                        nombre_reactions: Math.max(0, (prev.find((p) => p.id_publication === id)?.nombre_reactions ?? 1) - 1),
                    })
                );
            })

            .on("postgres_changes", { event: "INSERT", schema: "public", table: "commentaire" }, (payload) => {
                const id = (payload.new as any)?.id_publication;
                if (!id) return;
                setPublications((prev) =>
                    patchPublication(prev, id, {
                        nombre_commentaires: (prev.find((p) => p.id_publication === id)?.nombre_commentaires ?? 0) + 1,
                    })
                );
            })
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "commentaire" }, (payload) => {
                const id = (payload.old as any)?.id_publication;
                if (!id) return;
                setPublications((prev) =>
                    patchPublication(prev, id, {
                        nombre_commentaires: Math.max(0, (prev.find((p) => p.id_publication === id)?.nombre_commentaires ?? 1) - 1),
                    })
                );
            })

            .on("postgres_changes", { event: "INSERT", schema: "public", table: "favoris" }, (payload) => {
                const id = (payload.new as any)?.id_publication;
                if (!id) return;
                setPublications((prev) => patchPublication(prev, id, { a_favoris: true }));
            })
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "favoris" }, (payload) => {
                const id = (payload.old as any)?.id_publication;
                if (!id) return;
                setPublications((prev) => patchPublication(prev, id, { a_favoris: false }));
            })

            .on("postgres_changes", { event: "INSERT", schema: "public", table: "publication" }, async () => reload())
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "publication" }, async () => reload())
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "publication" }, async () => reload())

            .subscribe();

        return () => { channel.unsubscribe(); };
    }, [groupId, reload]);

    const removePublication = useCallback((id: number) => {
        setPublications((prev) => prev.filter((p) => p.id_publication !== id));
    }, []);

    return { publications, reload, removePublication, toasts, showToast, hideToast };
}