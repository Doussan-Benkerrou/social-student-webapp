"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getInvitations, acceptInvitation, refuseInvitation } from "../services/invitationService";
import { useToast } from "./UseToast";
import { searchUsers } from "@/services/GroupsService";
import { inviteUserToGroup } from "@/services/invitationService";


export default function useInvitations() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, hideToast } = useToast();

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    const result = await getInvitations();
    if (!result.success) {
      showToast(result.message || "Erreur lors du chargement des invitations.", "error");
      setInvitations([]);
    } else {
      setInvitations(result.data ?? []);
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleAccept = async (invitationId: number, idUtilisateur: number, idGroupe: number) => {
    const result = await acceptInvitation(invitationId, idUtilisateur, idGroupe);
    if (result.success) {
      showToast(result.message || "Invitation acceptée.", "success");
      setInvitations((prev) => prev.filter((i) => i.id_invitation !== invitationId));
    } else {
      showToast(result.message || "Erreur lors de l'acceptation.", "error");
    }
  };

  const handleRefuse = async (invitationId: number) => {
    const result = await refuseInvitation(invitationId);
    if (result.success) {
      showToast(result.message || "Invitation refusée.", "success");
      setInvitations((prev) => prev.filter((i) => i.id_invitation !== invitationId));
    } else {
      showToast(result.message || "Erreur lors du refus.", "error");
    }
  };

  return { invitations, loading, handleAccept, handleRefuse, toasts, showToast, hideToast };
}



export interface InviteSearchResult {
  id_utilisateur: number
  nom: string
  prenom: string
  filiere: string | null
  photo_profile: string | null
  isMember: boolean
  isInvited: boolean
}

export function useInviteGroup(groupId: number, id_emetteur: number) {
    const [query, setQuery]         = useState("")
    const [results, setResults]     = useState<InviteSearchResult[]>([])
    const [searching, setSearching] = useState(false)
    const [invited, setInvited]     = useState<Set<number>>(new Set())
    const [inviting, setInviting]   = useState<Set<number>>(new Set())
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const { toasts, showToast, hideToast } = useToast();

    const handleSearch = useCallback(
        (value: string) => {
            setQuery(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (!value.trim()) { setResults([]); return; }

            setSearching(true);
            debounceRef.current = setTimeout(async () => {
                const result = await searchUsers(value, groupId);
                if (result.success) {
                    setResults(result.data ?? []);
                } else {
                    showToast("Erreur lors de la recherche.", "error");
                    setResults([]);
                }
                setSearching(false);
            }, 350);
        },
        [groupId, showToast]
    );

    const handleInvite = useCallback(
        async (id_recepteur: number) => {
            setInviting((prev) => new Set(prev).add(id_recepteur));
            const result = await inviteUserToGroup(groupId, id_emetteur, id_recepteur);
            if (result.success) {
                setInvited((prev) => new Set(prev).add(id_recepteur));
                showToast("Invitation envoyée avec succès.", "success");
            } else {
                showToast(result.message ?? "Erreur lors de l'invitation.", "error");
            }
            setInviting((prev) => {
                const next = new Set(prev);
                next.delete(id_recepteur);
                return next;
            });
        },
        [groupId, id_emetteur, showToast]
    );

    return {
        query, results, searching, invited, inviting,
        handleSearch, handleInvite,
        toasts, showToast, hideToast,
    };
}