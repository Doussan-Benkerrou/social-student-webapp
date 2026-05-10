"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    getMessagesPaginated, sendMessage, deleteMessage,
    markMessagesAsRead, getUnreadMessagesCount, getTotalUnreadMessagesCount,
} from "@/services/messagesService";
import type { Message } from "@/lib/types";

const LIMIT    = 20;

export function useMessages(id_discussion: number, id_requester: number) {
    const [messages, setMessages]   = useState<Message[]>([]);
    const [unreadCount, setUnread]  = useState(0);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState<string | null>(null);
    const [page, setPage]           = useState(0);
    const [hasMore, setHasMore]     = useState(true);

    const loadMessages = useCallback(async (currentPage: number) => {
        setLoading(true);
        setError(null);
        const data = await getMessagesPaginated(id_discussion, currentPage, LIMIT);
        if (data.length < LIMIT) setHasMore(false);
        const chronological = [...data].reverse();
        setMessages((prev) => currentPage === 0 ? chronological : [...chronological, ...prev]);
        setLoading(false);
    }, [id_discussion]);

    useEffect(() => {
        setMessages([]);
        setPage(0);
        setHasMore(true);
        loadMessages(0);
    }, [id_discussion]); 

    useEffect(() => {
        if (id_requester) markMessagesAsRead(id_discussion, id_requester);
    }, [id_discussion, id_requester]);

    useEffect(() => { setUnread(0); }, [id_discussion]);

    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel(`messages:${id_discussion}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "message", filter: `id_discussion=eq.${id_discussion}` },
                async (payload) => {
                    const newMsg = payload.new as Message;
                    const { data: sender } = await supabase
                        .from("utilisateur").select("id_utilisateur, nom, prenom, photo_profile")
                        .eq("id_utilisateur", newMsg.id_sender).single();

                    const enriched = { ...newMsg, senderInfo: sender ?? null };
                    setMessages((prev) => prev.some((m) => m.id_message === enriched.id_message) ? prev : [...prev, enriched]);

                    if (enriched.id_sender !== id_requester) {
                        setUnread((prev) => prev + 1);
                        markMessagesAsRead(id_discussion, id_requester);
                    }
                })
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "message", filter: `id_discussion=eq.${id_discussion}` },
                (payload) => setMessages((prev) => prev.filter((m) => m.id_message !== payload.old.id_message)))
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [id_discussion, id_requester]);

    const loadMore = useCallback(() => {
        if (!hasMore || loading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        loadMessages(nextPage);
    }, [hasMore, loading, page, loadMessages]);

    return { messages, setMessages, loading, error, hasMore, loadMore, unreadCount };
}

export function useSendMessage() {
    const [sending, setSending] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    const send = useCallback(async (content: string, id_discussion: number, id_sender: number): Promise<Message | null> => {
        setSending(true); setError(null);
        const result = await sendMessage({ content, id_discussion, id_sender });
        if (!result) setError("Impossible d'envoyer le message");
        setSending(false);
        return result;
    }, []);

    return { send, sending, error };
}

export function useDeleteMessage(setMessages?: React.Dispatch<React.SetStateAction<Message[]>>) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError]       = useState<string | null>(null);

    const remove = useCallback(async (id_message: number, id_sender: number): Promise<boolean> => {
        setDeleting(true); setError(null);
        if (setMessages) setMessages((prev) => prev.filter((m) => m.id_message !== id_message));
        const success = await deleteMessage(id_message, id_sender);
        if (!success) setError("Impossible de supprimer le message");
        setDeleting(false);
        return success;
    }, [setMessages]);

    return { remove, deleting, error };
}

export function useMarkAsRead() {
    const [marking, setMarking] = useState(false);

    const markAsRead = useCallback(async (id_discussion: number, id_lecteur: number): Promise<boolean> => {
        setMarking(true);
        const success = await markMessagesAsRead(id_discussion, id_lecteur);
        setMarking(false);
        return success;
    }, []);

    return { markAsRead, marking };
}

export function useUnreadCount(id_discussion: number, id_user: number) {
    const [count, setCount]     = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchCount = useCallback(async () => {
        const result = await getUnreadMessagesCount(id_discussion, id_user);
        setCount(result ?? 0);
        setLoading(false);
    }, [id_discussion, id_user]);

    useEffect(() => { fetchCount(); }, [fetchCount]);

    return { count, loading };
}

export function useTotalUnreadCount(id_user: number) {
    const [total, setTotal]               = useState(0);
    const [loading, setLoading]           = useState(true);
    const [discussionIds, setDiscussionIds] = useState<number[]>([]);

    useEffect(() => {
        if (!id_user) return;
        const supabase = createClient();
        supabase
            .from("discussion")
            .select("id_discussion")
            .or(`id_user1.eq.${id_user},id_user2.eq.${id_user}`)
            .then(({ data }) => {
                setDiscussionIds((data ?? []).map((d: any) => d.id_discussion));
            });
    }, [id_user]);

    const fetchTotal = useCallback(async () => {
        setTotal(await getTotalUnreadMessagesCount(id_user));
        setLoading(false);
    }, [id_user]);

    useEffect(() => { fetchTotal(); }, [fetchTotal]);

    useEffect(() => {
        if (discussionIds.length === 0) return;

        const supabase = createClient();
        const channel = supabase
            .channel(`total-unread:${id_user}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "message" }, (payload) => {
                const msg = payload.new as any;
                if (msg.id_sender !== id_user && discussionIds.includes(msg.id_discussion)) {
                    setTotal((prev) => prev + 1);
                }
            })
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "message" }, (payload) => {
                const oldMsg = payload.old as any;
                const newMsg = payload.new as any;
                if (
                    !oldMsg.is_read &&
                    newMsg.is_read &&
                    newMsg.id_sender !== id_user &&
                    discussionIds.includes(newMsg.id_discussion)
                ) {
                    setTotal((prev) => Math.max(0, prev - 1));
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [id_user, discussionIds]);

    return { total, loading };
}