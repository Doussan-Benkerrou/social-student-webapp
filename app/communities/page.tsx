"use client";

import { useState } from "react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import useUser from "@/hooks/useUser"
import CommunityCard from "@/components/communities/CommunityCard"
import { deleteGroup } from "@/services/GroupsService"
import { useGroupes, useNonMembres } from "@/hooks/useCommunity"
import { getDiscussionIdByGroupe } from "@/services/communityService"
import { Plus, X, Camera, Search, Hash, Loader2, AlertCircle } from "lucide-react"
import { ResponseType } from "@/lib/types"
import { createGroupDiscussion } from "@/services/discussionService"

type Tab = "my" | "discover";

export default function CommunitiesPage() {
    const router = useRouter();
    const { user, loading: userLoading } = useUser()
    const curUser: ResponseType = user
        ? { success: true, data: user }
        : { success: false};

    const currentUserId = user ? Number(user.id_utilisateur) : null

    const { groupes, loading, error, handleJoin, handleCreate, reload } =
        useGroupes(currentUserId);

    const [activeTab, setActiveTab] = useState<Tab>("my")
    const [showCreate, setShowCreate] = useState(false)
    const [createName, setCreateName] = useState("")
    const [createDesc, setCreateDesc] = useState("")
    const [creating, setCreating] = useState(false)

    const [showInviteId, setShowInviteId] = useState<number | null>(null)
    const [inviteSearch, setInviteSearch] = useState("")
    const { nonMembres, loading: inviteLoading, handleInvite } =
        useNonMembres(showInviteId);

    const myCommunities = groupes.filter((g) => g.isMember)
    const discoverCommunities = groupes.filter((g) => !g.isMember)

    const filteredNonMembres = nonMembres.filter((u) => {
        if (!inviteSearch.trim()) return true;
    
        const q = inviteSearch.toLowerCase()
        const nom = (u.nom || '').toLowerCase()
        const prenom = (u.prenom || '').toLowerCase()
        const filiere = (u.filiere || '').toLowerCase()
        
        return nom.includes(q) || prenom.includes(q) || filiere.includes(q)
    });

    const handleDelete = async (id_groupe: number) => {
        if (!confirm("Supprimer cette communauté ?")) return;
        await deleteGroup(id_groupe);
        await reload();
    };

    
    const onViewDiscussion = async (id_groupe: number) => {
        const id_discussion = await getDiscussionIdByGroupe(id_groupe);
        if (id_discussion) {
            router.push(`/messages/${id_discussion}`)
        } else {
            const discussion = await createGroupDiscussion(id_groupe)
            router.push(`/messages/${discussion?.id_discussion}`)
        }
    };

    const onCreateSubmit = async () => {
        if (!createName.trim()) return;
        setCreating(true);
        const result = await handleCreate(createName, createDesc);
        setCreating(false);
        if (result) {
            setCreateName("");
            setCreateDesc("");
            setShowCreate(false);
            const id_discussion = await getDiscussionIdByGroupe(result.id_groupe)
            if (id_discussion) {
                router.push(`/messages/${id_discussion}`)
            } else {
                router.push(`/messages?groupe=${result.id_groupe}`)
            }
        }
    };

    const displayed = activeTab === "my" ? myCommunities : discoverCommunities

    if (userLoading || currentUserId === null) {
        return (
            <AppLayout curUser={curUser}>
                <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-blue-300" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout curUser={curUser}>
            <div className="max-w-4xl mx-auto p-6 space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display font-bold text-2xl text-slate-900">
                            Communautés
                        </h1>
                        <p className="text-sm text-slate-500 font-body mt-0.5">
                            Discussions de groupe thématiques
                        </p>
                    </div>
                    <button onClick={() => setShowCreate(true)} className="btn-primary">
                        <Plus size={16} /> Créer une communauté
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-body">
                        <AlertCircle size={15} />
                        {error}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                    {(["my", "discover"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`px-5 py-2 rounded-lg text-sm font-display font-semibold transition-all
                                ${activeTab === t
                                    ? "bg-white shadow-sm text-brand-700"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {t === "my"
                                ? `Mes communautés (${myCommunities.length})`
                                : `Découvrir (${discoverCommunities.length})`}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-slate-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayed.map((groupe) => (
                            <CommunityCard
                                key={groupe.id_groupe}
                                curUser={curUser}
                                groupe={groupe}
                                mode={activeTab}
                                onViewDiscussion={onViewDiscussion}
                                onJoin={handleJoin}
                                onInvite={(id) => {
                                    setShowInviteId(id);
                                    setInviteSearch("");
                                }}
                                onDelete={handleDelete}
                            />
                        ))}

                        {displayed.length === 0 && (
                            <div className="col-span-2 card p-12 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
                                    <Hash size={24} className="text-violet-400" />
                                </div>
                                <p className="font-display font-semibold text-slate-700">
                                    {activeTab === "my"
                                        ? "Aucune communauté"
                                        : "Aucune communauté à découvrir"}
                                </p>
                                <p className="text-sm text-slate-400 font-body mt-1">
                                    {activeTab === "my"
                                        ? "Créez ou rejoignez une communauté pour commencer."
                                        : "Toutes les communautés disponibles ont été rejointes."}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showCreate && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="card max-w-md w-full p-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-display font-bold text-lg text-slate-900">
                                Créer une communauté
                            </h3>
                            <button onClick={() => setShowCreate(false)} className="btn-icon">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors">
                                    <Camera size={20} className="text-slate-400 mb-1" />
                                    <span className="text-[10px] text-slate-400 font-body">Photo</span>
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Nom de la communauté</label>
                                <input
                                    value={createName}
                                    onChange={(e) => setCreateName(e.target.value)}
                                    placeholder="Nom de la communauté…"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="input-label">Description</label>
                                <textarea
                                    value={createDesc}
                                    onChange={(e) => setCreateDesc(e.target.value)}
                                    placeholder="Décrivez le thème de cette communauté…"
                                    rows={3}
                                    className="input-field resize-none"
                                />
                            </div>

                            <div className="bg-violet-50 rounded-xl p-3 text-xs text-violet-700 font-body">
                                Après création, vous serez redirigé vers la discussion de la communauté.
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="btn-secondary flex-1 justify-center"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={onCreateSubmit}
                                    disabled={creating || !createName.trim()}
                                    className="btn-primary flex-1 justify-center disabled:opacity-50"
                                    style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
                                >
                                    {creating ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        "Créer"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showInviteId && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="card max-w-sm w-full p-6 animate-slide-up space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display font-bold text-base text-slate-900">
                                Inviter des personnes
                            </h3>
                            <button onClick={() => setShowInviteId(null)} className="btn-icon">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="relative">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                value={inviteSearch}
                                onChange={(e) => setInviteSearch(e.target.value)}
                                placeholder="Rechercher…"
                                className="input-field pl-8"
                            />
                        </div>

                        <div className="space-y-1 -mx-2 max-h-72 overflow-y-auto">
                            {inviteLoading ? (
                                <div className="flex justify-center py-6">
                                    <Loader2 size={20} className="animate-spin text-slate-400" />
                                </div>
                            ) : filteredNonMembres.length === 0 ? (
                                <p className="text-center text-sm text-slate-400 font-body py-6">
                                    Aucun utilisateur trouvé.
                                </p>
                            ) : (
                                filteredNonMembres.map((u) => (
                                    <div
                                        key={u.id_utilisateur}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-display font-bold text-xs shrink-0">
                                            {(u.prenom[0] + u.nom[0]).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-display font-semibold text-sm text-slate-800">
                                                {u.prenom} {u.nom}
                                            </p>
                                            <p className="text-xs text-slate-400 font-body">{u.filiere}</p>
                                        </div>
                                        <button
                                            onClick={() => handleInvite(u.id_utilisateur)}
                                            disabled={u.invited}
                                            className={`py-1.5 px-3 text-xs rounded-lg font-display font-semibold transition-colors
                                                ${u.invited
                                                    ? "bg-green-50 text-green-600 cursor-default"
                                                    : "btn-primary"
                                                }`}
                                            style={
                                                !u.invited
                                                    ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }
                                                    : undefined
                                            }
                                        >
                                            {u.invited ? "Invité ✓" : "Inviter"}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setShowInviteId(null)}
                            className="btn-secondary w-full justify-center"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}