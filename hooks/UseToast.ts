import { useCallback, useState } from "react";
import { ToastItem, ToastType } from "@/lib/types";

export function useToast() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        setToasts((prev) => [
            ...prev,
            {
                id: Date.now() + Math.floor(Math.random() * 1000),
                message,
                type,
            },
        ]);
    }, []);

    const hideToast = useCallback((id?: number) => {
        setToasts((prev) => {
            if (typeof id !== "number") {
                return prev.slice(1);
            }

            return prev.filter((toast) => toast.id !== id);
        });
    }, []);

    return {
        toast: toasts[0] ?? null,
        toasts,
        showToast,
        hideToast,
    };
}
