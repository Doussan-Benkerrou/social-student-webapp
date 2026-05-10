"use client";

import React, { useState } from "react";
import { Trash2, Clock } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { getSafeInitials, getSafeText, formatTime } from "@/lib/utils";
import type { Message } from "@/lib/types";

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    onDelete?: (id_message: number) => Promise<void>;
    isPending?: boolean;
}


const MessageBubble = React.memo(function MessageBubble({
    message,
    isOwn,
    onDelete,
    isPending = false,
}: MessageBubbleProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [hovered, setHovered] = useState(false);

    const handleDelete = async () => {
        if (!onDelete || isPending) return;
        setIsDeleting(true);
        await onDelete(message.id_message);
        setIsDeleting(false);
    };

    const senderName = message.senderInfo
        ? `${getSafeText(message.senderInfo.prenom)} ${getSafeText(message.senderInfo.nom)}`.trim()
        : null;

    const senderInitials = message.senderInfo
        ? getSafeInitials(message.senderInfo.prenom, message.senderInfo.nom)
        : "?";

    const timeLabel = formatTime(message.date_message);

    return (
        <div
            className={`flex items-end gap-2 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {!isOwn && (
                <div className="shrink-0 mb-1">
                    <Avatar
                        initials={senderInitials}
                        src={message.senderInfo?.photo_profile ?? null}
                        size="xs"
                        color="from-brand-400 to-brand-700"
                    />
                </div>
            )}

            <div className={`flex flex-col gap-0.5 max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                {/* nom expediteur */}
                {!isOwn && senderName && (
                    <span className="text-[11px] text-slate-400 font-body px-1">
                        {senderName}
                    </span>
                )}

                {/* Bulle + bouton supprimer */}
                <div className={`flex items-end gap-1.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>

                    {isOwn && onDelete && !isPending && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            title="Supprimer ce message"
                            className={`shrink-0 p-1 rounded-md text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all duration-150 ${
                                hovered ? "opacity-100" : "opacity-0"
                            } disabled:opacity-40`}
                        >
                            <Trash2 size={13} />
                        </button>
                    )}

                    {/* Bulle du message */}
                    <div
                        className={`px-3.5 py-2 rounded-2xl text-sm font-body leading-relaxed break-words ${
                            isPending
                                ? isOwn
                                    ? "bg-brand-200 text-brand-800 opacity-70"
                                    : "bg-slate-100 text-slate-500 opacity-70"
                                : isOwn
                                ? "bg-brand-600 text-white rounded-br-sm"
                                : "bg-white border border-slate-100 text-slate-800 shadow-sm rounded-bl-sm"
                        }`}
                        style={{ wordBreak: "break-word" }}
                    >
                        {message.content}
                    </div>
                </div>

                <div className={`flex items-center gap-1 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                    {isPending ? (
                        <span className="text-[10px] text-slate-300 font-body flex items-center gap-1">
                            <Clock size={9} className="animate-pulse" />
                            Envoi…
                        </span>
                    ) : timeLabel ? (
                        <span className="text-[10px] text-slate-300 font-body">
                            {timeLabel}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
});

export default MessageBubble;