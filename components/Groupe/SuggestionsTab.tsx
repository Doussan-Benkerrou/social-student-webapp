"use client";

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Users, ArrowRight, Clock, Loader2} from "lucide-react"
import { GroupeUI, ResponseType } from "@/lib/types"
import { getSuggestionGroups } from "@/services/GroupsService"
import { useGroupsRealtime } from "@/hooks/useGroups"
import { joinGroupAsMember } from "@/services/memberService"
import { isMembre } from "@/services/memberService"
import { getSafeText, normalizeSuggestion } from "@/lib/utils"
import { useToast } from "@/hooks/UseToast"
import ToastStack from "@/components/ui/ToastStack"

interface SuggestionsTabProps {
    curUser: ResponseType;
    onCountChange?: (count: number) => void;
    initialSuggestionsResult: ResponseType;
}

export default function SuggestionsTab({ onCountChange, initialSuggestionsResult, curUser }: SuggestionsTabProps) {
    const [suggestions, setSuggestions] = useState<GroupeUI[]>(() =>
        Array.isArray(initialSuggestionsResult.data?.groups)
            ? initialSuggestionsResult.data.groups.map(normalizeSuggestion)
            : []
    );
    const [pendingGroupIds, setPendingGroupIds] = useState<number[]>(() =>
        Array.isArray(initialSuggestionsResult.data?.pendingGroupIds)
            ? initialSuggestionsResult.data.pendingGroupIds
            : []
    );
    const [memberStatusMap, setMemberStatusMap] = useState<Map<number, boolean>>(new Map());
    const [refreshing, setRefreshing] = useState(false);
    const { toasts, showToast, hideToast } = useToast();

    const isInitialError = !initialSuggestionsResult.success && suggestions.length === 0;

    useEffect(() => {
        const checkMembershipStatus = async () => {
            if (!curUser.data?.id_utilisateur || suggestions.length === 0) return;
            
            const statusMap = new Map<number, boolean>();
            
            for (const group of suggestions) {
                try {
                    const isMember = await isMembre(group.id, curUser.data.id_utilisateur);
                    statusMap.set(group.id, isMember);
                } catch (error) {
                    console.error(`Erreur vérification membre pour groupe ${group.id}:`, error);
                    statusMap.set(group.id, false);
                }
            }
            
            setMemberStatusMap(statusMap);
        };
        
        checkMembershipStatus();
    }, [suggestions, curUser.data?.id_utilisateur]);

    useEffect(() => {
        onCountChange?.(suggestions.length);
    }, [suggestions.length, onCountChange]);

    useEffect(() => {
        if (isInitialError) {
            showToast(initialSuggestionsResult.message ?? "Impossible de charger les suggestions de groupes.", "error");
        }
    }, [initialSuggestionsResult.message, isInitialError, showToast]);

    const reloadSuggestions = useCallback(async () => {
        setRefreshing(true);
        const result = await getSuggestionGroups();
        setRefreshing(false);

        if (!result.success) {
            showToast(result.message ?? "Impossible de charger les suggestions de groupes.", "error");
            setSuggestions([]);
            setPendingGroupIds([]);
            return;
        }

        setSuggestions((result.data?.groups ?? []).map(normalizeSuggestion));
        setPendingGroupIds(result.data?.pendingGroupIds ?? []);
    }, [showToast]);

    useGroupsRealtime(reloadSuggestions, curUser.data?.id_utilisateur);

    async function handleJoinGroup(idGroup: number, id_user: number) {
        if (!id_user) {
            showToast("Vous devez être connecté pour rejoindre un groupe.", "error");
            return;
        }

        const alreadyMember = await isMembre(idGroup, id_user);
        if (alreadyMember) {
            showToast("Vous êtes déjà membre de ce groupe.", "error");
            return;
        }

        const result = await joinGroupAsMember(idGroup, id_user);

        if (!result.success) {
            showToast(result.message ?? "Échec de l'envoi de la demande de participation.", "error");
            return;
        }

        setPendingGroupIds((prev) => (prev.includes(idGroup) ? prev : [...prev, idGroup]));
        showToast("Demande de participation envoyée ! En attente de validation de l'admin.", "success");
    }

    const emptyMessage = useMemo(() => {
        if (isInitialError) return "Aucune suggestion.";
        return "Aucune suggestion de groupe disponible pour le moment.";
    }, [isInitialError]);

    const filteredSuggestions = useMemo(() => {
        return suggestions.filter(group => {
            const isMember = memberStatusMap.get(group.id);
            return !isMember; 
        });
    }, [suggestions, memberStatusMap]);

    return (
        <>
            <ToastStack toasts={toasts} onClose={hideToast} />

            {refreshing && (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400 py-2">
                    <Loader2 size={14} className="animate-spin" /> Actualisation...
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSuggestions.length === 0 ? (
                    <p className="col-span-2 text-center text-sm text-slate-400 font-body py-12">
                        {emptyMessage}
                    </p>
                ) : (
                    filteredSuggestions.map((group) => {
                        const isPending = pendingGroupIds.includes(group.id);
                        const isMember = memberStatusMap.get(group.id);

                        if (isMember) return null;

                        return (
                            <div key={group.id} className="card-hover p-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0">
                                        {group.photo ? (
                                            <img src={group.photo} alt={group.nom} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={`w-full h-full bg-gradient-to-br ${group.color} flex items-center justify-center text-white font-display font-bold text-base`}>
                                                {getSafeText(group.initials).slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <Link href={`/groups/${group.id}`} className="font-display font-bold text-base text-slate-900 hover:text-brand-700 transition-colors truncate">
                                                {getSafeText(group.nom)}
                                            </Link>
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

                                    {isPending ? (
                                        <button 
                                            disabled 
                                            className="btn-secondary py-2 px-4 text-xs text-slate-400 cursor-not-allowed flex items-center gap-1.5"
                                        >
                                            <Clock size={12} /> En attente
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleJoinGroup(group.id, curUser.data?.id_utilisateur)} 
                                            className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
                                        >
                                            <Users size={12} /> Rejoindre
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
}