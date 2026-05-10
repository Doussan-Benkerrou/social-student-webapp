"use client"

import { useState } from "react";
import { X, Save } from "lucide-react";
import { GroupeUI } from "@/lib/types";
import { updateGroup } from "@/services/GroupsService";

interface Props {
    idGroup: number;
    group: GroupeUI;
    onClose: () => void;
    onSaved: () => void;
    onRequestDelete: () => void;
    showToast: (message: string, type: "success" | "error") => void;
}

export default function GroupSettingsModal({
    idGroup,
    group,
    onClose,
    onSaved,
    onRequestDelete,
    showToast,
}: Props) {
    const [editName, setEditName] = useState(group.nom);
    const [editDesc, setEditDesc] = useState(group.description);
    const [editPhoto, setEditPhoto] = useState<File | null>(null);
    const [editLoading, setEditLoading] = useState(false);

    const handleUpdate = async () => {
        if (!editName.trim() || !editDesc.trim()) {
            showToast("Le nom et la description sont requis.", "error");
            return;
        }
        setEditLoading(true);
        const r = await updateGroup(
            idGroup,
            { nameGroup: editName, description: editDesc },
            editPhoto,
            group.photo ?? null,
        );
        setEditLoading(false);
        if (!r.success) {
            showToast(r.message ?? "Erreur.", "error");
            return;
        }
        onClose();
        showToast("Groupe modifié avec succès.", "success");
        onSaved();
    };

    const handleDeleteClick = () => {
        onClose();
        onRequestDelete();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card max-w-md w-full p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-bold text-lg text-slate-900">
                        Paramètres du groupe
                    </h3>
                    <button onClick={onClose} className="btn-icon">
                        <X size={16} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="input-label">Nom du groupe</label>
                        <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="input-label">Description</label>
                        <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows={3}
                            className="input-field resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="btn-secondary flex-1 justify-center"
                        >
                            Annuler
                        </button>

                        <button
                            onClick={handleUpdate}
                            disabled={editLoading}
                            className="btn-primary flex-1 justify-center flex items-center gap-1.5 disabled:opacity-60"
                        >
                            <Save size={14} />
                            {editLoading ? "Enregistrement…" : "Enregistrer"}
                        </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <button
                            onClick={handleDeleteClick}
                            className="btn-secondary text-red-600 hover:bg-red-50 border-red-200 w-full justify-center"
                        >
                            Supprimer le groupe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}