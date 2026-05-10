"use client";

import ToastStack from "@/components/ui/ToastStack";
import CreatePublicationUser from "./CreatePublicationUser";
import PublicationCardUser from "./PublicationCardUser";
import { usePublicationUserFeed } from "@/hooks/usePublicationFeed";
import type { ResponseType } from "@/lib/types";

type Props = {
    publicationsResult: ResponseType;
    curUser: ResponseType;
    categories: ResponseType;
};

export default function PublicationUserModal({ publicationsResult, curUser, categories }: Props) {
    const { publications, reload, removePublication, toasts, hideToast } =
        usePublicationUserFeed(publicationsResult);

    return (
        <>
            <ToastStack toasts={toasts} onClose={hideToast} />
            <div className="space-y-4">
                <CreatePublicationUser categories={categories} curUser={curUser} onSuccess={reload} />

                {publications.length > 0 ? (
                    publications.map((pub) => (
                        <PublicationCardUser
                            key={pub.id_publication}
                            publication={pub}
                            curUser={curUser}
                            categories={categories}
                            onDelete={removePublication}
                            onUpdate={reload}
                        />
                    ))
                ) : (
                    <div className="card p-12 text-center">
                        <p className="text-slate-400 font-body">Aucune publication.</p>
                    </div>
                )}
            </div>
        </>
    );
}