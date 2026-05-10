"use client";

import Toast from "./Toast";
import { ToastItem } from "@/lib/types";

type ToastStackProps = {
    toasts: ToastItem[];
    onClose: (id: number) => void;
};

export default function ToastStack({ toasts, onClose }: ToastStackProps) {
    if (!toasts.length) return null;

    return (
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 w-full max-w-sm">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onClose(toast.id)}
                />
            ))}
        </div>
    );
}
