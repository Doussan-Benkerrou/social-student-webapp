"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ArrowRight, Shield, UserCheck, Loader2 } from "lucide-react";
import ToastStack from "@/components/ui/ToastStack";
import InviteGroup from "./InviteGroup";
import Image from "next/image"
import { getSafeText } from "@/lib/utils";
import { useMyGroups } from "@/hooks/useGroups";
import type { GroupeUI, MyGroupsTabProps, ResponseType } from "@/lib/types";

type Props = MyGroupsTabProps & {
    curUser: ResponseType;
    initialMyGroupsResult: ResponseType;
};

export default function MyGroupsTab({ onCountChange, initialMyGroupsResult, curUser }: Props) {
    const { myGroups, refreshing, emptyMessage, toasts, hideToast } = useMyGroups(initialMyGroupsResult);

    const [showInvite, setShowInvite]     = useState(false);
    const [inviteGroup, setInviteGroup]   = useState<GroupeUI | null>(null);

    useEffect(() => {
        onCountChange?.(myGroups.length);
    }, [myGroups.length, onCountChange]);

    return (
        <>
            <ToastStack toasts={toasts} onClose={hideToast} />

            {refreshing && (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400 py-2">
                    <Loader2 size={14} className="animate-spin" /> Actualisation...
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myGroups.length === 0 ? (
                    <p className="col-span-2 text-center text-sm text-slate-400 font-body py-12">
                        {emptyMessage}
                    </p>
                ) : (
                    myGroups.map((group) => (
                        <div key={group.id} className="card-hover p-5">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 relative">
                                    {group.photo ? (
                                        <Image 
                                            src={group.photo} 
                                            alt={group.nom} 
                                            fill
                                            className="object-cover"
                                            sizes="56px"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-br ${group.color} flex items-center justify-center text-white font-display font-bold text-base`}>
                                            {getSafeText(group.initials).slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                        <Link
                                            href={`/groups/${group.id}`}
                                            className="font-display font-bold text-base text-slate-900 hover:text-brand-700 transition-colors truncate"
                                        >
                                            {getSafeText(group.nom)}
                                        </Link>
                                        {group.role && (
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${group.role === "admin" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"}`}>
                                                {group.role === "admin" ? <><Shield size={9} /> Administrateur</> : <><UserCheck size={9} /> Membre</>}
                                            </span>
                                        )}
                                        <span className="chip text-[10px]">{getSafeText(group.type)}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-body mb-2 line-clamp-2">
                                        {getSafeText(group.description, "")}
                                    </p>
                                    <p className="text-xs text-slate-400 font-body flex items-center gap-1">
                                        <Users size={11} /> {group.membres} membres
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                <Link href={`/groups/${group.id}`} className="flex-1">
                                    <button className="btn-secondary w-full justify-center py-2 text-xs">
                                        Voir le groupe <ArrowRight size={13} />
                                    </button>
                                </Link>
                                <button
                                    onClick={() => { setInviteGroup(group); setShowInvite(true); }}
                                    className="btn-primary py-2 px-4 text-xs"
                                >
                                    Inviter
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showInvite && (
                <InviteGroup
                    groupId={inviteGroup?.id ?? 0}
                    id_emetteur={curUser.data?.id_utilisateur}
                    onClose={() => setShowInvite(false)}
                />
            )}
        </>
    );
}