"use client";

import { useState } from "react";
import { Shield, ShieldOff, Loader2 } from "lucide-react";
import { useBlockList } from "@/hooks/useBlockList";

interface BlockButtonProps {
    targetUserId: number;
    className?: string;
}

export default function BlockButton({ targetUserId, className = "" }: BlockButtonProps) {
    const { isUserBlocked, block, unblock } = useBlockList();
    const [loading, setLoading] = useState(false);

    const blocked = isUserBlocked(targetUserId);

    const handleToggle = async () => {
        setLoading(true);
        try {
            if (blocked) {
                await unblock(targetUserId);
            } else {
                await block(targetUserId);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-display font-semibold transition-all disabled:opacity-60 ${
                blocked
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    : "btn-secondary text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
            } ${className}`}
            title={blocked ? "Débloquer cet utilisateur" : "Bloquer cet utilisateur"}
        >
            {loading ? (
                <Loader2 size={15} className="animate-spin" />
            ) : blocked ? (
                <ShieldOff size={15} />
            ) : (
                <Shield size={15} />
            )}
            {loading ? "…" : blocked ? "Débloquer" : "Bloquer"}
        </button>
    );
}