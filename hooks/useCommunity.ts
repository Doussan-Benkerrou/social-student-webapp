"use client";
import { useEffect, useState, useCallback } from "react";
import { GroupeWithMeta } from "@/lib/types";
import {
  fetchGroupesDiscussion,
  createGroupe,
  joinGroupe,
  inviteToGroupe,
  fetchNonMembres,
} from "@/services/communityService";


export type NonMembre = {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  filiere: string;
  invited?: boolean;
};

export function useGroupes(currentUserId: number | null) {
  const [groupes, setGroupes] = useState<GroupeWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGroupesDiscussion(currentUserId);
      setGroupes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleJoin = async (id_groupe: number) => {
    if (!currentUserId) return;
    setGroupes((prev) =>
      prev.map((g) =>
        g.id_groupe === id_groupe ? { ...g, pendingRequest: true } : g
      )
    );
    try {
      await joinGroupe(id_groupe, currentUserId);
      await load();
    } catch (err: any) {
      setGroupes((prev) =>
        prev.map((g) =>
          g.id_groupe === id_groupe ? { ...g, pendingRequest: false } : g
        )
      );
      setError(err.message);
    }
  };

  const handleCreate = async (nom: string, description: string) => {
    if (!currentUserId || !nom.trim()) return null;
    try {
      const nouveau = await createGroupe(nom, description, currentUserId);
      await load();
      return nouveau;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  return {
    groupes,
    loading,
    error,
    handleJoin,
    handleCreate,
    reload: load,
  };
}

export function useNonMembres(id_groupe: number | null) {
  const [nonMembres, setNonMembres] = useState<NonMembre[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id_groupe) return;
    setLoading(true);
    fetchNonMembres(id_groupe)
      .then((data) =>
        setNonMembres(data.map((u) => ({ ...u, invited: false })))
      )
      .finally(() => setLoading(false));
  }, [id_groupe]);

  const handleInvite = async (id_utilisateur: number) => {
    if (!id_groupe) return;
    try {
      await inviteToGroupe(id_groupe, id_utilisateur);
      setNonMembres((prev) =>
        prev.map((u) =>
          u.id_utilisateur === id_utilisateur ? { ...u, invited: true } : u
        )
      );
    } catch (err: any) {
      console.error("Invite error:", err.message);
    }
  };

  return { nonMembres, loading, handleInvite };
}