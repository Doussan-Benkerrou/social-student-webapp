"use client";

import { useMemo, useState } from "react"
import AppLayout from "../../components/layout/AppLayout"
import MyGroupsTab from "../../components/Groupe/MyGroupsTab"
import SuggestionsTab from "../../components/Groupe/SuggestionsTab"
import { ResponseType, Tab } from "@/lib/types"
import { Plus } from "lucide-react"
import CreateGroupModal from "@/components/Groupe/CreateGroupModal"

type Props = {
    curUser: ResponseType
    myGroupsResult: ResponseType
    suggestionsResult: ResponseType
};

export default function GroupsPage({ curUser, myGroupsResult, suggestionsResult }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("my");
    const [myGroupsCount, setMyGroupsCount] = useState(0);
    const [suggestionsCount, setSuggestionsCount] = useState(0);
    const [showCreate, setShowCreate] = useState(false);

    const initialMyCount = useMemo(() => Array.isArray(myGroupsResult.data) ? myGroupsResult.data.length : 0, [myGroupsResult.data]);
    const initialSuggestionCount = useMemo(() => Array.isArray(suggestionsResult.data?.groups) ? suggestionsResult.data.groups.length : 0, [suggestionsResult.data]);

    return (
        <AppLayout curUser={curUser}>
            <div className="max-w-4xl mx-auto p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display font-bold text-2xl text-slate-900">Mes groupes</h1>
                        <p className="text-sm text-slate-500 font-body mt-0.5">
                            Gérez vos groupes de publication
                        </p>
                    </div>
                    <div className="flex justify-end mb-2">
                        <button onClick={() => setShowCreate(true)} className="btn-primary">
                            <Plus size={16} /> Créer un groupe
                        </button>
                    </div>
                </div>

                <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                    {(["my", "suggestions"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`px-5 py-2 rounded-lg text-sm font-display font-semibold transition-all ${
                                activeTab === t
                                    ? "bg-white shadow-sm text-brand-700"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {t === "my"
                                ? `Mes groupes (${myGroupsCount || initialMyCount})`
                                : `Découvrir (${suggestionsCount || initialSuggestionCount})`}
                        </button>
                    ))}
                </div>

                <CreateGroupModal showCreate={showCreate} setShowCreate={setShowCreate} />

                {activeTab === "my" && (
                    <MyGroupsTab
                        initialMyGroupsResult={myGroupsResult}
                        onCountChange={setMyGroupsCount}
                        curUser={curUser}
                    />
                )}

                {activeTab === "suggestions" && (
                    <SuggestionsTab
                        initialSuggestionsResult={suggestionsResult}
                        onCountChange={setSuggestionsCount}
                        curUser = {curUser}
                    />
                )}
            </div>
        </AppLayout>
    );
}
