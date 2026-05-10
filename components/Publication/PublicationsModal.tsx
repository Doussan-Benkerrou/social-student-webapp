"use client";

import ToastStack from "@/components/ui/ToastStack";
import CreatePublication from "./CreatePublication";
import PublicationCard from "./PublicationCard";
import { usePublicationGroupFeed } from "@/hooks/usePublicationFeed";
import type { ResponseType } from "@/lib/types";

type Props = {
    isAdminOrMember: boolean;
    groupId: number;
    initialPublicationsResult: ResponseType;
    categories: ResponseType;
    curUser: ResponseType;
};

export default function PublicationsModal({
    isAdminOrMember, groupId, initialPublicationsResult, categories, curUser,
}: Props) {
    const { publications, reload, removePublication, toasts, hideToast } =
        usePublicationGroupFeed(groupId, initialPublicationsResult);

    return (
        <>
            <ToastStack toasts={toasts} onClose={hideToast} />
            <div className="space-y-4">
                {isAdminOrMember && (
                    <CreatePublication groupId={groupId} categories={categories} curUser={curUser} onSuccess={reload} />
                )}

                {publications.length > 0 ? (
                    publications.map((publication) => (
                        <PublicationCard
                            key={publication.id_publication}
                            publication={publication}
                            curUser={curUser}
                            categories={categories}
                            onDelete={removePublication}
                            onUpdate={reload}
                            readOnly={!isAdminOrMember}
                        />
                    ))
                ) : (
                    <div className="card p-12 text-center">
                        <p className="text-slate-400 font-body">Aucune publication dans ce groupe.</p>
                    </div>
                )}
            </div>
        </>
    );
}