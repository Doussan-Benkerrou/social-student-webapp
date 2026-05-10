"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import PublicationCard from "@/components/Publication/PublicationCard"
import { PublicationItem, ResponseType } from "@/lib/types"
import { useToast } from "@/hooks/UseToast"
import ToastStack from "@/components/ui/ToastStack"
import { BookmarkCheck } from "lucide-react"
import { getFavorisPublications } from "@/services/PublicationService"

type Props = {
    curUser: ResponseType
    initialFavorites: ResponseType
    categories: ResponseType
}

export default function FavoritesClient({ curUser, initialFavorites, categories }: Props) {
    const [publications, setPublications] = useState<PublicationItem[]>(initialFavorites.data ?? []);
    const { toasts, showToast, hideToast } = useToast();

    if (!initialFavorites.success) {
        showToast(initialFavorites.message || "Erreur lors du chargement des favoris.", "error")
    }

    const handleRefresh = async () => {
        const result = await getFavorisPublications()
        if (result.success) {
            setPublications(result.data ?? [])
        } else {
            showToast(result.message || "Erreur lors du rafraîchissement.", "error")
        }
    }

    const handleDelete = (id: number) => {
        setPublications((prev) => prev.filter((p) => p.id_publication !== id))
    }

    return (
        <AppLayout curUser={curUser}>
            <ToastStack toasts={toasts} onClose={hideToast} />
            <div className="max-w-4xl mx-auto p-6 space-y-5">
                <div>
                    <h1 className="font-display font-bold text-2xl text-slate-900">Mes favoris</h1>
                    <p className="text-sm text-slate-500 font-body mt-0.5">
                        Vos publications sauvegardées
                    </p>
                </div>

                {publications.length === 0 ? (
                    <div className="card p-10 text-center">
                        <BookmarkCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 font-body text-sm">Aucun favori pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {publications.map((pub) => (
                            <PublicationCard
                                key={pub.id_publication}
                                publication={pub}
                                curUser={curUser}
                                categories={categories}
                                onDelete={handleDelete}
                                onUpdate={handleRefresh}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
