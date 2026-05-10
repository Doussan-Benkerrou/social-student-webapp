"use client";

import { useState, useEffect } from "react";
import { Camera, X, XCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createGroupPublication } from "@/services/GroupsService";
import { groupSchema, GroupSchema } from "@/lib/validations/groupSchema";
import type { CreateGroupModalProps } from "@/lib/types";


export default function CreateGroupModal({ showCreate, setShowCreate }: CreateGroupModalProps) {
    const [photoFile, setPhotoFile]     = useState<File | null>(null);
    const [previewUrl, setPreviewUrl]   = useState<string | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const { register, handleSubmit, reset, formState: { errors } } = useForm<GroupSchema>({
        resolver: zodResolver(groupSchema),
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    useEffect(() => {
        if (!photoFile) { setPreviewUrl(null); return; }
        const url = URL.createObjectURL(photoFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [photoFile]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (file && !allowed.includes(file.type)) {
            setSubmitError("Format non supporté. Utilisez JPG, PNG ou WebP.");
            return;
        }
        if (file && file.size > 5 * 1024 * 1024) {
            setSubmitError("La photo doit faire moins de 5 Mo.");
            return;
        }
        setPhotoFile(file);
        setSubmitError("");
    };

    const onSubmit = async (data: GroupSchema) => {
        setSubmitError("");
        setSubmitLoading(true);
        const result = await createGroupPublication(data, photoFile);
        setSubmitLoading(false);
        if (!result.success) {
            setSubmitError(result.message ?? "Une erreur est survenue. Veuillez réessayer.");
            return;
        }
        handleClose();
    };

    const handleClose = () => {
        setShowCreate(false);
        setSubmitError("");
        setPhotoFile(null);
        reset();
    };

    if (!showCreate) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card max-w-md w-full p-6 animate-slide-up">

                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-bold text-lg text-slate-900">Créer un groupe</h3>
                    <button type="button" onClick={handleClose} className="btn-icon">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" onChange={() => setSubmitError("")}>

                    {/* Photo */}
                    <div className="flex flex-col items-center gap-2">
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            id="group-photo-upload"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                        <label htmlFor="group-photo-upload" className="cursor-pointer">
                            <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-brand-400 hover:bg-brand-50 transition-colors overflow-hidden">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Camera size={20} className="text-slate-400 mb-1" />
                                        <span className="text-[10px] text-slate-400 font-body">Photo</span>
                                    </>
                                )}
                            </div>
                        </label>
                        {previewUrl && (
                            <button
                                type="button"
                                onClick={() => setPhotoFile(null)}
                                className="text-xs text-red-500 hover:underline font-body"
                            >
                                Supprimer la photo
                            </button>
                        )}
                        <p className="text-[11px] text-slate-400 font-body">
                            JPG, PNG ou WebP · 5 Mo max
                        </p>
                    </div>

                    <div>
                        <label className="input-label">Nom du groupe</label>
                        <input
                            {...register("nameGroup")}
                            placeholder="Entrez un nom de groupe…"
                            className={`input-field ${errors.nameGroup ? "border-red-300 focus:ring-red-200" : ""}`}
                        />
                        {errors.nameGroup && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <XCircle size={12} /> {errors.nameGroup.message}
                            </p>
                        )}
                    </div>


                    <div>
                        <label className="input-label">Description</label>
                        <textarea
                            {...register("description")}
                            placeholder="Décrivez l'objectif de ce groupe…"
                            rows={3}
                            className={`input-field resize-none ${errors.description ? "border-red-300 focus:ring-red-200" : ""}`}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <XCircle size={12} /> {errors.description.message}
                            </p>
                        )}
                    </div>

                    {submitError && (
                        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 animate-fade-in">
                            <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-body text-red-700">{submitError}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={handleClose} className="btn-secondary flex-1 justify-center">
                            Annuler
                        </button>
                        <button type="submit" disabled={submitLoading} className="btn-primary flex-1 justify-center disabled:opacity-60">
                            {submitLoading ? "Création…" : "Créer le groupe"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}