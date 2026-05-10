"use client";

import { ImageIcon, Tag, EyeOff, ChevronDown, X, Loader2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import ToastStack from "@/components/ui/ToastStack";
import type { CategorieItem, MediaItem } from "@/lib/types";

interface CreatePublicationFormProps {
    open: boolean;
    setOpen: (v: boolean) => void;
    isEditMode: boolean;
    contenu: string;
    setContenu: (v: string) => void;
    isAnonyme: boolean;
    setIsAnonyme: (v: boolean) => void;
    selectedCategorie: CategorieItem | null;
    setSelectedCategorie: (c: CategorieItem) => void;
    showCatDrop: boolean;
    setShowCatDrop: (v: boolean) => void;
    submitting: boolean;
    categoriesData: CategorieItem[];
    existingMedias: MediaItem[];
    newPreviews: string[];
    fileInputRef: React.RefObject<HTMLInputElement>;
    currentUserInitials: string;
    currentUserName: string;
    currentUser: any;
    toasts: any[];
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeNewFile: (index: number) => void;
    removeExistingMedia: (media: MediaItem) => void;
    handleSubmit: () => void;
    handleCancel: () => void;
    hideToast: (id?: number) => void;
    placeholder?: string;
}

export default function CreatePublicationForm({
    open, setOpen, isEditMode,
    contenu, setContenu, isAnonyme, setIsAnonyme,
    selectedCategorie, setSelectedCategorie,
    showCatDrop, setShowCatDrop,
    submitting, categoriesData,
    existingMedias, newPreviews, fileInputRef,
    currentUserInitials, currentUserName, currentUser,
    toasts, hideToast,
    handleFileChange, removeNewFile, removeExistingMedia,
    handleSubmit, handleCancel,
    placeholder = "Partagez vos pensées, posez une question, annoncez un événement…",
}: CreatePublicationFormProps) {
    if (!isEditMode && !open) {
        return (
            <div
                onClick={() => setOpen(true)}
                className="card p-4 flex items-center gap-3 cursor-text hover:shadow-card-hover transition-shadow"
            >
                <Avatar src={currentUser?.photo_profile ?? null} initials={currentUserInitials} size="sm" color="from-brand-400 to-brand-700" />
                <div className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-400 font-body select-none">
                    Quoi de neuf, {currentUser?.prenom ?? "…"} ? Partagez quelque chose…
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastStack toasts={toasts} onClose={hideToast} />
            <div className="card p-5 animate-slide-up">
                <div className="flex items-start gap-3 mb-4">
                    <Avatar src={currentUser?.photo_profile ?? null} initials={currentUserInitials} size="md" color="from-brand-400 to-brand-700" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="font-display font-semibold text-sm text-slate-800">{currentUserName}</span>
                            {isAnonyme && <span className="chip text-xs">Anonyme</span>}
                        </div>
                        <textarea
                            autoFocus
                            value={contenu}
                            onChange={(e) => setContenu(e.target.value)}
                            placeholder={placeholder}
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-body placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white resize-none transition-all"
                        />
                    </div>
                </div>

                {existingMedias.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 ml-14">
                        {existingMedias.map((media) => (
                            <div key={media.id_media} className="relative group">
                                {media.type_media === "image"
                                    ? <img src={media.url_media} alt="média" className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                                    : <video src={media.url_media} className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                                }
                                <button type="button" onClick={() => removeExistingMedia(media)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {newPreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 ml-14">
                        {newPreviews.map((preview, index) => (
                            <div key={`${preview}-${index}`} className="relative group">
                                <img src={preview} alt="aperçu" className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                                <button type="button" onClick={() => removeNewFile(index)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 ml-14 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={handleFileChange} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5">
                            <ImageIcon size={14} /> Média
                        </button>

                        <div className="relative">
                            <button type="button" onClick={() => setShowCatDrop(!showCatDrop)} className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5">
                                <Tag size={14} /> {selectedCategorie?.nom_categorie ?? "Catégorie"}
                                <ChevronDown size={12} />
                            </button>
                            {showCatDrop && (
                                <div className="absolute top-full left-0 mt-1.5 w-44 bg-white rounded-xl shadow-card-hover border border-slate-100 py-1 z-20 animate-fade-in">
                                    {categoriesData.map((cat) => (
                                        <button key={cat.id_categorie} type="button" onClick={() => { setSelectedCategorie(cat); setShowCatDrop(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                            {cat.nom_categorie}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="button" onClick={() => setIsAnonyme(!isAnonyme)} className={`btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 ${isAnonyme ? "bg-slate-900 text-white border-slate-900" : ""}`}>
                            <EyeOff size={14} /> Anonyme
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button type="button" onClick={handleCancel} className="btn-ghost py-2 px-4 text-xs">Annuler</button>
                        <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary py-2 px-4 text-xs flex items-center gap-2 disabled:opacity-70">
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                            {isEditMode ? "Enregistrer" : "Publier"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}