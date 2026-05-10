"use client";

import { Search, UserCheck, UserPlus, Loader2, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import ToastStack from "@/components/ui/ToastStack";
import { getSafeInitials, getSafeText } from "@/lib/utils";
import { useInviteGroup } from "@/hooks/useInvitation";

interface InviteGroupProps {
    groupId: number;
    groupName?: string;
    id_emetteur: number;
    onClose: () => void;
}

export default function InviteGroup({ groupId, groupName, id_emetteur, onClose }: InviteGroupProps) {
    const {
        query, results, searching, invited, inviting,
        handleSearch, handleInvite,
        toasts, hideToast,
    } = useInviteGroup(groupId, id_emetteur);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <ToastStack toasts={toasts} onClose={hideToast} />

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h2 className="font-display font-bold text-slate-900">Inviter des membres</h2>
                        {groupName && (
                            <p className="text-xs text-slate-400 font-body mt-0.5">dans {groupName}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-4">
                    <div className="relative">
                        {searching ? (
                            <Loader2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400 animate-spin" />
                        ) : (
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        )}
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Rechercher par nom, prénom ou filière…"
                            className="input-field pl-9 w-full"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="px-6 pb-6 space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                    {!query.trim() && (
                        <p className="text-center text-sm text-slate-400 font-body py-6">
                            Tapez un nom pour rechercher des utilisateurs.
                        </p>
                    )}
                    {query.trim() && !searching && results.length === 0 && (
                        <p className="text-center text-sm text-slate-400 font-body py-6">
                            Aucun utilisateur trouvé.
                        </p>
                    )}

                    {results.map((user) => {
                        const isBeingInvited = inviting.has(user.id_utilisateur);
                        const wasInvited     = user.isInvited || invited.has(user.id_utilisateur);

                        return (
                            <div key={user.id_utilisateur} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Avatar
                                        initials={getSafeInitials(user.prenom, user.nom)}
                                        src={null}
                                        size="sm"
                                        color="from-brand-400 to-brand-700"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-display font-semibold text-slate-800 truncate">
                                            {getSafeText(user.prenom)} {getSafeText(user.nom)}
                                        </p>
                                        {user.filiere && (
                                            <p className="text-xs text-slate-400 font-body truncate">
                                                {getSafeText(user.filiere)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {user.isMember ? (
                                    <span className="ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-display font-semibold shrink-0">
                                        <UserCheck size={13} /> Membre
                                    </span>
                                ) : wasInvited ? (
                                    <span className="ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-display font-semibold shrink-0">
                                        <UserCheck size={13} /> Invité
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleInvite(user.id_utilisateur)}
                                        disabled={isBeingInvited}
                                        className="ml-3 btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                                    >
                                        {isBeingInvited ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                                        {isBeingInvited ? "Envoi…" : "Inviter"}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}