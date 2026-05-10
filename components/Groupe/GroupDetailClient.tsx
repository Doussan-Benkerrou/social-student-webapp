"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useGroupDetail } from "@/hooks/useGroups";
import { Users, UserPlus, LogOut, Settings, Clock, XCircle } from "lucide-react";
import InviteGroup from "./InviteGroup";
import MembersList from "./MemberList";
import GroupSettingsModal from "./GroupSettingModal";
import DeleteGroupConfirmModal from "./DeleteGroupConfirmModal";
import PublicationsModal from "@/components/Publication/PublicationsModal";
import ToastStack from "@/components/ui/ToastStack";
import { getSafeText } from "@/lib/utils";
import type { ResponseType } from "@/lib/types";

type Props = {
    idGroup: number;
    curUser: ResponseType;
    groupResult: ResponseType;
    membersResult: ResponseType;
    userStatusResult: ResponseType;
    publicationsResult: ResponseType;
    categories: ResponseType;
};

export default function GroupDetailClient({
    idGroup, curUser, groupResult, membersResult,
    userStatusResult, publicationsResult, categories,
}: Props) {
    const {
        group, members, userStatus,
        handleJoin, handleLeave, handleRemoveMember, loadAll,
        toasts, showToast, hideToast,
    } = useGroupDetail(idGroup, curUser, groupResult, membersResult, userStatusResult);

    const [activeTab, setActiveTab]           = useState<"feed" | "members">("feed");
    const [showInvite, setShowInvite]         = useState(false);
    const [showSettings, setShowSettings]     = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isAdmin          = userStatus === "admin";
    const isMember         = userStatus === "membre";
    const isInvited        = userStatus === "pending";
    const isAdminOrMember  = isAdmin || isMember;

    if (!group) {
        return (
            <AppLayout curUser={curUser}>
                <ToastStack toasts={toasts} onClose={hideToast} />
                <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[40vh]">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-sm font-body text-red-700">{groupResult.message || "Groupe introuvable."}</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout curUser={curUser}>
            <ToastStack toasts={toasts} onClose={hideToast} />

            <div className="max-w-4xl mx-auto p-6 space-y-5">
                <div className="card overflow-hidden">
                    <div className={`h-32 bg-gradient-to-r ${group.color} relative`}>
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                    </div>

                    <div className="px-6 pb-5">
                        <div className="flex items-end justify-between -mt-8 mb-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-4 border-white shrink-0">
                                {group.photo ? (
                                    <img src={group.photo} alt={group.nom} className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${group.color} flex items-center justify-center text-white font-display font-bold text-xl`}>
                                        {group.initials?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mt-10 flex-wrap justify-end">
                                {isAdmin && (
                                    <button onClick={() => setShowSettings(true)} className="btn-secondary py-2 px-3 flex items-center gap-1.5">
                                        <Settings size={15} /> Gérer
                                    </button>
                                )}
                                {isAdminOrMember && (
                                    <button onClick={() => setShowInvite(true)} className="btn-primary py-2 flex items-center gap-1.5">
                                        <UserPlus size={15} /> Inviter
                                    </button>
                                )}
                                {isMember && (
                                    <button onClick={handleLeave} className="btn-ghost text-red-500 hover:bg-red-50 py-2 flex items-center gap-1.5">
                                        <LogOut size={15} /> Quitter
                                    </button>
                                )}
                                {isInvited && (
                                    <button disabled className="btn-secondary py-2 text-slate-400 cursor-not-allowed flex items-center gap-1.5">
                                        <Clock size={15} /> Pending
                                    </button>
                                )}
                                {userStatus === "none" && (
                                    <button onClick={handleJoin} className="btn-primary py-2 flex items-center gap-1.5">
                                        <UserPlus size={15} /> Demander à rejoindre
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="font-display font-bold text-xl text-slate-900">{getSafeText(group.nom)}</h1>
                            <span className="chip">{getSafeText(group.type)}</span>
                        </div>
                        <p className="text-sm text-slate-500 font-body mb-2">{getSafeText(group.description, "")}</p>
                        <p className="text-xs text-slate-400 font-body flex items-center gap-1">
                            <Users size={12} /> {group.membres} membres
                        </p>
                    </div>

                    <div className="flex border-t border-slate-100">
                        {(["feed", "members"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3.5 text-sm font-display font-semibold transition-colors ${activeTab === tab ? "text-brand-700 border-b-2 border-brand-600" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                {tab === "feed" ? "Publications" : `Membres (${group.membres ?? 0})`}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === "feed" && (
                    <PublicationsModal
                        isAdminOrMember={isAdminOrMember}
                        groupId={idGroup}
                        initialPublicationsResult={publicationsResult}
                        categories={categories}
                        curUser={curUser}
                    />
                )}
                {activeTab === "members" && (
                    <MembersList members={members} isAdmin={isAdmin} onRemoveMember={handleRemoveMember} />
                )}
            </div>

            {showInvite && (
                <InviteGroup groupId={idGroup} id_emetteur={curUser.data?.id_utilisateur} onClose={() => setShowInvite(false)} />
            )}
            {showSettings && (
                <GroupSettingsModal
                    idGroup={idGroup} group={group}
                    onClose={() => setShowSettings(false)}
                    onSaved={loadAll}
                    onRequestDelete={() => setShowDeleteConfirm(true)}
                    showToast={showToast}
                />
            )}
            {showDeleteConfirm && (
                <DeleteGroupConfirmModal
                    idGroup={idGroup} groupName={group.nom}
                    onClose={() => setShowDeleteConfirm(false)}
                    showToast={showToast}
                />
            )}
        </AppLayout>
    );
}