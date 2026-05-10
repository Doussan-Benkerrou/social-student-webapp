"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { ToastType } from "@/lib/types";

type ToastProps = {
    message: string;
    type: ToastType;
    onClose: () => void;
};

export default function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const config: Record<ToastType, { bg: string; text: string; icon: React.ReactNode }> = {
        success: {
            bg: "bg-green-50 border-green-200",
            text: "text-green-800",
            icon: <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />,
        },
        error: {
            bg: "bg-red-50 border-red-200",
            text: "text-red-800",
            icon: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
        },
        info: {
            bg: "bg-blue-50 border-blue-200",
            text: "text-blue-800",
            icon: <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />,
        },
    };

    const { bg, text, icon } = config[type];

    return (
        <div
            className={`
                flex items-start gap-3
                px-4 py-3 rounded-xl border shadow-lg
                max-w-sm w-full
                animate-slide-up
                ${bg}
            `}
        >
            {icon}
            <p className={`text-sm font-body ${text} flex-1`}>{message}</p>
            <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Fermer"
            >
                <X size={14} />
            </button>
        </div>
    );
}
