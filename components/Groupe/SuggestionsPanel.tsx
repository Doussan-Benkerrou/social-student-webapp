"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Users, Hash, ArrowRight } from "lucide-react";
import { GroupeUI, ResponseType } from "@/lib/types";
import { getSafeText, normalizeSuggestion } from "@/lib/utils";
import { useToast } from "@/hooks/UseToast";
import ToastStack from "@/components/ui/ToastStack";

export type SuggestionsPanelProps = {
    suggestionGroups: ResponseType;
    suggestionCommunities?: ResponseType;
};

export default function SuggestionsPanel({ suggestionGroups, suggestionCommunities }: SuggestionsPanelProps) {
    const { toasts, showToast, hideToast } = useToast();

    const groups = useMemo<GroupeUI[]>(() =>
        Array.isArray(suggestionGroups.data?.groups)
            ? suggestionGroups.data.groups.map(normalizeSuggestion)
            : [],
        [suggestionGroups.data]
    );

    const communities = useMemo<GroupeUI[]>(() =>
        Array.isArray(suggestionCommunities?.data?.groups)
            ? suggestionCommunities.data.groups.map(normalizeSuggestion)
            : [],
        [suggestionCommunities?.data]
    );

    useEffect(() => {
        if (!suggestionGroups.success && groups.length === 0) {
            showToast(suggestionGroups.message ?? "Impossible de charger les suggestions de groupes.", "error");
        }
        if (suggestionCommunities && !suggestionCommunities.success && communities.length === 0) {
            showToast(suggestionCommunities.message ?? "Impossible de charger les suggestions de communautés.", "error");
        }
    }, [suggestionGroups.success, suggestionGroups.message, suggestionCommunities, groups.length, communities.length, showToast]);

    function renderCard(item: GroupeUI, href: string) {
        return (
            <div key={item.id} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-display font-bold text-xs shrink-0 shadow-sm overflow-hidden`}>
                    {item.photo ? (
                        <img src={item.photo} alt={item.nom} className="w-full h-full object-cover" />
                    ) : (
                        getSafeText(item.initials).slice(0, 2).toUpperCase()
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <Link href={href} className="font-display font-semibold text-xs text-slate-800 hover:text-brand-700 transition-colors block truncate">
                        {getSafeText(item.nom)}
                    </Link>
                    <p className="text-[11px] text-slate-400 font-body flex items-center gap-1">
                        <Users size={10} /> {item.membres} membres
                    </p>
                </div>

                <Link href={href}>
                    <button className="btn-secondary py-1 px-2.5 text-[11px] flex items-center gap-1 whitespace-nowrap">
                        Voir <ArrowRight size={11} />
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <aside className="w-72 shrink-0 space-y-4">
            <ToastStack toasts={toasts} onClose={hideToast} />

            <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                        <Users size={15} className="text-brand-600" />
                        Groupes suggérés
                    </h3>
                </div>

                {groups.length === 0 ? (
                    <p className="text-xs text-slate-400 font-body text-center py-3">Aucun groupe suggéré pour le moment.</p>
                ) : (
                    <div className="space-y-3">{groups.map((g) => renderCard(g, `/groups/${g.id}`))}</div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100">
                    <Link href="/groups" className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[12px] font-display font-semibold text-brand-600 hover:bg-brand-50 transition-colors">
                        Voir plus <ArrowRight size={12} />
                    </Link>
                </div>
            </div>

            <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                        <Hash size={15} className="text-brand-600" />
                        Communautés suggérées
                    </h3>
                </div>

                {communities.length === 0 ? (
                    <p className="text-xs text-slate-400 font-body text-center py-3">Aucune communauté suggérée pour le moment.</p>
                ) : (
                    <div className="space-y-3">{communities.map((c) => renderCard(c, `/communities/${c.id}`))}</div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100">
                    <Link href="/communities" className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[12px] font-display font-semibold text-brand-600 hover:bg-brand-50 transition-colors">
                        Voir plus <ArrowRight size={12} />
                    </Link>
                </div>
            </div>

            <p className="text-center text-[11px] text-slate-300 font-body px-2">UniConnect © 2025 · Réseau social étudiant</p>
        </aside>
    );
}
