"use client"

import { useState } from "react";
import { X } from "lucide-react";
import { deleteGroup } from "@/services/GroupsService";
import { useRouter } from "next/navigation";

interface Props {
    idGroup: number;
    groupName: string;
    onClose: () => void;
    showToast: (message: string, type: "success" | "error") => void;
}

export default function DeleteGroupConfirmModal({
    idGroup,
    groupName,
    onClose,
    showToast,
}: Props) {
    const [deleteLoading, setDeleteLoading] = useState(false);
    const router= useRouter()
    const handleDelete = async () => {
        setDeleteLoading(true);
        const r = await deleteGroup(idGroup);
        setDeleteLoading(false);
        if (!r.success) {
            showToast(r.message ?? "Erreur.", "error");
            return;
        }
        router.push("/groups")
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card max-w-sm w-full p-6 animate-slide-up space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-slate-900">
                        Supprimer le groupe
                    </h3>
                    <button onClick={onClose} className="btn-icon">
                        <X size={16} />
                    </button>
                </div>

                <p className="text-sm text-slate-600 font-body">
                    Êtes-vous sûr de vouloir supprimer{" "}
                    <span className="font-semibold">{groupName}</span> ?
                    Cette action est irréversible.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="btn-secondary flex-1 justify-center"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="flex-1 justify-center btn-secondary text-red-600 hover:bg-red-50 border-red-200 disabled:opacity-60"
                    >
                        {deleteLoading ? "Suppression…" : "Supprimer"}
                    </button>
                </div>
            </div>
        </div>
    );
}