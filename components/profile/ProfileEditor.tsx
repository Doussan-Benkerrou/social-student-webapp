"use client";

import Image from "next/image";
import { Mail, X, Save, Camera, Trash2, Loader2 } from "lucide-react";
import { getSafeInitials } from "@/lib/utils";
import { useProfileEditor } from "@/hooks/useProfile";
import type { ResponseType } from "@/lib/types";

interface ProfileEditorProps {
    profile: ResponseType;
    onSaved?: (newPhotoUrl: string | null) => void;
    onCancel?: () => void;
}

export default function ProfileEditor({ profile, onSaved, onCancel }: ProfileEditorProps) {
    const {
        bio, setBio, filiere, setFiliere, niveau, setNiveau,
        previewUrl, uploadState, uploadProgress, uploadError,
        fileInputRef, isWorking,
        handleFileChange, handleRemovePhoto, handleCancel, handleSave,
    } = useProfileEditor(profile, onSaved, onCancel);

    const initials = getSafeInitials(profile.data?.prenom, profile.data?.nom);

    return (
        <div className="space-y-6">
            {/* photo */}
            <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
                        {previewUrl ? (
                            <Image src={previewUrl} alt="Aperçu" width={112} height={112} className="w-full h-full object-cover" unoptimized />
                        ) : (
                            <span className="text-2xl font-bold text-slate-400 font-display">{initials}</span>
                        )}
                    </div>
                    <label htmlFor="photo-upload" className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera size={24} className="text-white" />
                    </label>
                </div>

                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" id="photo-upload" className="hidden" onChange={handleFileChange} />

                <div className="flex gap-2">
                    <label htmlFor="photo-upload" className="btn-secondary text-xs cursor-pointer flex items-center gap-1">
                        <Camera size={13} />
                        {previewUrl ? "Changer" : "Ajouter une photo"}
                    </label>
                    {previewUrl && (
                        <button type="button" onClick={handleRemovePhoto} className="btn-secondary text-red-500 border-red-200 hover:bg-red-50 text-xs flex items-center gap-1">
                            <Trash2 size={13} /> Supprimer
                        </button>
                    )}
                </div>

                {(uploadState === "uploading" || uploadState === "compressing") && (
                    <div className="w-full max-w-xs">
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 font-body">
                            <Loader2 size={12} className="animate-spin" />
                            {uploadState === "compressing" ? "Compression…" : `Upload… ${uploadProgress}%`}
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    </div>
                )}

                {uploadError && <p className="text-xs text-red-500 font-body">{uploadError}</p>}
                <p className="text-[11px] text-slate-400 font-body">JPG, PNG ou WebP · 5 Mo max · sera redimensionnée à 400 px</p>
            </div>

            {/* Champs texte */}
            <div className="space-y-3">
                <div>
                    <label className="input-label text-sm font-semibold">Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field resize-none" rows={3} placeholder="Bio (quelques mots sur vous)" maxLength={300} />
                </div>
                <div>
                    <label className="input-label text-sm font-semibold">Filière</label>
                    <input value={filiere} onChange={(e) => setFiliere(e.target.value)} className="input-field" placeholder="Filière (ex: Informatique)" maxLength={100} />
                </div>
                <div>
                    <label className="input-label text-sm font-semibold">Niveau d'étude</label>
                    <input value={niveau} onChange={(e) => setNiveau(e.target.value)} className="input-field" placeholder="Niveau d'étude (ex: Master 1)" maxLength={50} />
                </div>
            </div>

            {/* Infos non modifiables */}
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                <span className="flex items-center gap-1.5 text-sm text-slate-500 font-body">
                    <Mail size={14} className="text-brand-500" />
                    {profile.data?.email_univer}
                </span>
            </div>

            <div className="flex gap-3 pt-2">
                <button onClick={handleCancel} disabled={isWorking} className="btn-secondary flex-1 justify-center">
                    <X size={15} /> Annuler
                </button>
                <button onClick={handleSave} disabled={isWorking} className="btn-primary flex-1 justify-center disabled:opacity-60">
                    {isWorking ? <><Loader2 size={15} className="animate-spin" /> Enregistrement…</> : <><Save size={15} /> Enregistrer</>}
                </button>
            </div>
        </div>
    );
}