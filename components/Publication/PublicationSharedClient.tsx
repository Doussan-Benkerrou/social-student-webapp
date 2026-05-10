"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import PublicationCard from "@/components/Publication/PublicationCard";
import { ResponseType } from "@/lib/types";
import { XCircle, ArrowLeft } from "lucide-react";
import { getPublicationById } from "@/services/PublicationService";

type Props = {
    pubId: number;
    curUser: ResponseType;
    publicationResult: ResponseType;
    categories: ResponseType;
};

export default function PublicationSharedClient({ pubId, curUser, publicationResult, categories }: Props) {
    const router = useRouter();
    const [publication, setPublication] = useState(publicationResult.success ? publicationResult.data?.pub ?? null : null);
    const [loadError, setLoadError] = useState(publicationResult.success ? "" : publicationResult.message ?? "Publication introuvable.");
    const currentUserId = publicationResult.success ? publicationResult.data?.currentUserId ?? null : null;

    if (loadError || !publication) {
        return (
            <AppLayout curUser={curUser}>
                <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[40vh] gap-4">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-sm font-body text-red-700">{loadError || "Publication introuvable."}</p>
                    </div>
                    <button onClick={() => router.back()} className="btn-secondary">
                        <ArrowLeft size={14} /> Retour
                    </button>
                </div>
            </AppLayout>
        );
    }

    const isOwner = currentUserId !== null && publication.auteur?.id_utilisateur === currentUserId;

    async function reloadPublication() {
        const res = await getPublicationById(pubId);
        if (!res.success || !res.data) {
            setLoadError(res.message ?? "Publication introuvable.");
            setPublication(null);
            return;
        }

        setPublication(res.data.pub);
    }

    return (
        <AppLayout curUser={curUser}>
            <div className="max-w-2xl mx-auto p-6 space-y-4">
                <button onClick={() => router.back()} className="btn-secondary flex items-center gap-1.5">
                    <ArrowLeft size={14} /> Retour
                </button>

                <PublicationCard
                    publication={publication}
                    curUser={curUser}
                    categories={categories}
                    readOnly={false}
                    onDelete={() => router.push("/dashboard")}
                    onUpdate={reloadPublication}
                />
            </div>
        </AppLayout>
    );
}
