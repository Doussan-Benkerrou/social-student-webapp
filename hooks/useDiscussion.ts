"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    getDiscussionById, getDiscussionsByUser,
    getDiscussionByGroup, createPrivateDiscussion, createGroupDiscussion,
    deleteDiscussion, canAccessDiscussion,
} from "@/services/discussionService";
import type { Message, Discussion } from "@/lib/types";


export function useDiscussion(id_discussion: number) {
    const [discussion, setDiscussion] = useState<Discussion | null>(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        const data = await getDiscussionById(id_discussion);
        if (!data) setError("Discussion introuvable");
        setDiscussion(data);
        setLoading(false);
    }, [id_discussion]);

    useEffect(() => { fetch(); }, [fetch]);

    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel(`discussion:${id_discussion}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "message", filter: `id_discussion=eq.${id_discussion}` },
                () => fetch())
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [id_discussion, fetch]);

    return { discussion, loading, error, refetch: fetch };
}

export function useDiscussionsByUser(id_user: number) {
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!id_user) return;
        setLoading(true);
        setError(null);

        const all = await getDiscussionsByUser(id_user);
        setDiscussions(all);
        setLoading(false);
    }, [id_user]);

    useEffect(() => { fetch(); }, [fetch]);

    useEffect(() => {
        if (!id_user) return;
        const supabase = createClient();
        const channel = supabase
            .channel(`discussions:user:${id_user}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "discussion" }, (payload) => {
                const d = payload.new as Discussion;
                if (d.id_user1 === id_user || d.id_user2 === id_user) {
                    setDiscussions((prev) => [d, ...prev]);
                }
                if (d.id_groupe !== null) fetch();
            })
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "discussion" }, (payload) => {
                setDiscussions((prev) => prev.filter((d) => d.id_discussion !== payload.old.id_discussion));
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [id_user, fetch]);

    return { discussions, loading, error, refetch: fetch };
}

export function useDiscussionByGroup(id_group: number) {
    const [discussion, setDiscussion] = useState<Discussion | null>(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        const data = await getDiscussionByGroup(id_group);
        if (!data) setError("Aucune discussion pour ce groupe");
        setDiscussion(data);
        setLoading(false);
    }, [id_group]);

    useEffect(() => { fetch(); }, [fetch]);

    useEffect(() => {
        if (!discussion) return;
        const supabase = createClient();
        const channel = supabase
            .channel(`discussion:group:${id_group}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "message", filter: `id_discussion=eq.${discussion.id_discussion}` },
                () => fetch())
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [id_group, discussion, fetch]);

    return { discussion, loading, error, refetch: fetch };
}

export function useCanAccessDiscussion(id_discussion: number, id_requester: number) {
    const [allowed, setAllowed] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const result = await canAccessDiscussion(id_discussion, id_requester);
            if (!cancelled) { setAllowed(result); setLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [id_discussion, id_requester]);

    return { allowed, loading };
}

export function useCreateDiscussion() {
    const [creating, setCreating] = useState(false);
    const [error, setError]       = useState<string | null>(null);

    const createPrivate = useCallback(async (id_user1: number, id_user2: number): Promise<Discussion | null> => {
        setCreating(true); setError(null);
        const result = await createPrivateDiscussion(id_user1, id_user2);
        if (!result) setError("Impossible de créer la discussion (existe déjà ou données invalides)");
        setCreating(false);
        return result;
    }, []);

    const createGroup = useCallback(async (id_groupe: number): Promise<Discussion | null> => {
        setCreating(true); setError(null);
        const result = await createGroupDiscussion(id_groupe);
        if (!result) setError("Impossible de créer la discussion de groupe");
        setCreating(false);
        return result;
    }, []);

    return { createPrivate, createGroup, creating, error };
}

export function useDeleteDiscussion() {
    const [deleting, setDeleting] = useState(false);
    const [error, setError]       = useState<string | null>(null);

    const removeDis = useCallback(async (id_discussion: number, id_requester: number): Promise<boolean> => {
        setDeleting(true); setError(null);
        const success = await deleteDiscussion(id_discussion, id_requester);
        if (!success) setError("Impossible de supprimer la discussion");
        setDeleting(false);
        return success;
    }, []);

    return { removeDis, deleting, error };
}