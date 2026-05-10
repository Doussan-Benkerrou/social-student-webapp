"use client";

import { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { blockUser, unblockUser, getBlockedUsers } from "@/services/blocageService";
import useUser from "./useUser";
import type { Discussion } from "@/lib/types";

export type BlockedUser = {
  id_bloque: number;
  date_blocage: string;
  utilisateur: {
    nom: string;
    prenom: string;
    photo_profile: string | null;
  };
};

type BlockListContextValue = ReturnType<typeof useBlockListInternal>;

const BlockListContext = createContext<BlockListContextValue | null>(null);


export function BlockListProvider({ children }: { children: React.ReactNode }) {
  const value = useBlockListInternal();
  return (
    <BlockListContext.Provider value={value}>
      {children}
    </BlockListContext.Provider>
  );
}

function useBlockListInternal() {
  const { user } = useUser();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isLoadingRef = useRef(false);
  const blockedIdsRef = useRef<Set<number>>(new Set());

  const fetchBlockedUsers = useCallback(async () => {
    if (!user?.id_utilisateur || isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const response = await getBlockedUsers(user.id_utilisateur);
      
      if (response.success && response.data) {
        setBlockedUsers(response.data);
        blockedIdsRef.current = new Set(
          response.data.map((bu: BlockedUser) => bu.id_bloque)
        );
        setError(null);
      }
    } catch (err) {
      setError("Erreur lors du chargement de la liste de blocage");
      console.error("[useBlockList] Erreur fetch:", err);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [user?.id_utilisateur]);

  useEffect(() => {
    if (!user?.id_utilisateur) return;

    fetchBlockedUsers();
    
    const supabase = createClient();
    const channelName = `blocage_${user.id_utilisateur}`;
    supabase.removeChannel(supabase.channel(channelName));
    
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blocage",
          filter: `id_bloqueur=eq.${user.id_utilisateur}`,
        },
        () => { fetchBlockedUsers(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch(console.error);
    };
  }, [user?.id_utilisateur, fetchBlockedUsers]);

  const block = useCallback(
    async (userIdToBlock: number): Promise<boolean> => {
      if (!user?.id_utilisateur) return false;

      try {
        blockedIdsRef.current.add(userIdToBlock);
        const response = await blockUser(user.id_utilisateur, userIdToBlock);
        
        if (response.success) {
          await fetchBlockedUsers();
          return true;
        } else {
          blockedIdsRef.current.delete(userIdToBlock);
          return false;
        }
      } catch (err) {
        blockedIdsRef.current.delete(userIdToBlock);
        setError("Erreur lors du blocage");
        console.error("[useBlockList] Erreur block:", err);
        return false;
      }
    },
    [user?.id_utilisateur, fetchBlockedUsers]
  );

  const unblock = useCallback(
    async (userIdToUnblock: number): Promise<boolean> => {
      if (!user?.id_utilisateur) return false;

      try {
        setBlockedUsers((prev) =>
          prev.filter((bu) => bu.id_bloque !== userIdToUnblock)
        );
        blockedIdsRef.current.delete(userIdToUnblock);

        const response = await unblockUser(user.id_utilisateur, userIdToUnblock);
        
        if (response.success) {
          return true;
        } else {
          await fetchBlockedUsers();
          return false;
        }
      } catch (err) {
        await fetchBlockedUsers();
        setError("Erreur lors du déblocage");
        console.error("[useBlockList] Erreur unblock:", err);
        return false;
      }
    },
    [user?.id_utilisateur, fetchBlockedUsers]
  );

  const isUserBlocked = useCallback(
    (userId: number): boolean => {
      return blockedIdsRef.current.has(userId);
    },
    []
  );


  const isDiscussionBlocked = useCallback(
    (discussion: Discussion | null): boolean => {
      if (!discussion || !user?.id_utilisateur) return false;
      
      if (discussion.id_groupe !== null) return false;

      let otherUserId: number | null = null;
      
      if (discussion.id_user1 === user.id_utilisateur) {
        otherUserId = discussion.id_user2;
      } else if (discussion.id_user2 === user.id_utilisateur) {
        otherUserId = discussion.id_user1;
      }
      
      if (!otherUserId) return false;
      
      const currentUserBlockedOther = isUserBlocked(otherUserId);
      
      const otherBlockedCurrentUser = blockedUsers.some(
        (bu) => bu.id_bloque === user.id_utilisateur
      );
      
      return currentUserBlockedOther || otherBlockedCurrentUser;
    },
    [user?.id_utilisateur, isUserBlocked, blockedUsers]
  );


  const isBlockedBetweenUsers = useCallback(
    (userId1: number, userId2: number): boolean => {
      const user1BlockedUser2 = blockedIdsRef.current.has(userId2);
      const user2BlockedUser1 = blockedUsers.some(
        (bu) => bu.id_bloque === userId1
      );
      return user1BlockedUser2 || user2BlockedUser1;
    },
    [blockedUsers]
  );

  const getBlockMessage = useCallback(
    (discussion: Discussion | null): string => {
      if (!discussion || !user?.id_utilisateur) return "";
      
      if (discussion.id_groupe !== null) return "";
      
      let otherUserId: number | null = null;
      
      if (discussion.id_user1 === user.id_utilisateur) {
        otherUserId = discussion.id_user2;
      } else if (discussion.id_user2 === user.id_utilisateur) {
        otherUserId = discussion.id_user1;
      }
      
      if (!otherUserId) return "Conversation verrouillée";
      
      const currentUserBlockedOther = isUserBlocked(otherUserId);
      
      if (currentUserBlockedOther) {
        return "Vous avez bloqué cet utilisateur • Débloquez-le pour envoyer des messages";
      } else {
        return "Cet utilisateur vous a bloqué • Vous ne pouvez plus envoyer de messages";
      }
    },
    [user?.id_utilisateur, isUserBlocked]
  );

  return {
    blockedUsers,
    isLoading,
    error,
    block,
    unblock,
    isUserBlocked,
    isDiscussionBlocked,      
    isBlockedBetweenUsers,    
    getBlockMessage,          
    refetch: fetchBlockedUsers,
  };
}


export function useBlockList() {
  const ctx = useContext(BlockListContext);
  const fallback = useBlockListInternal();
  return ctx ?? fallback;
}