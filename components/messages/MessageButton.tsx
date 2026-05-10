"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";
import { getOrCreatePrivateDiscussion, getDiscussionByGroup } from "@/services/discussionService";

interface MessageButtonProps {
    currentUserId: number;
    profileUserId?: number;
    id_groupe?: number;
    content: string;
    className?: string;
}

export function MessageButton({ currentUserId, profileUserId, id_groupe, content = "", className }: MessageButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleClick = useCallback(async () => {
        if (profileUserId !== undefined && currentUserId === profileUserId) return;

        setLoading(true);

        try {
            if (profileUserId !== undefined) {
                const discussion = await getOrCreatePrivateDiscussion(currentUserId, profileUserId);
                if (discussion?.id_discussion) {
                    router.push(`/messages/${discussion.id_discussion}`);
                }
            } else if (id_groupe !== undefined) {
                const discussion = await getDiscussionByGroup(id_groupe);
                if (discussion?.id_discussion) {
                    router.push(`/messages/${discussion.id_discussion}`);
                }
            }
        } catch (err) {
            console.error("[MessageButton]", err);
        } finally {
            setLoading(false);
        }
    }, [currentUserId, profileUserId, id_groupe, router]);

    if (profileUserId !== undefined && currentUserId === profileUserId) return null;

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={className ?? "btn-primary flex items-center gap-1.5 disabled:opacity-60"}
        >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} />}
            {loading ? "Connexion…" : content}
        </button>
    );
}