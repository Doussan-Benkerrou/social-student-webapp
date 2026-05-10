"use client";

import { useMemo } from "react";
import { useBlockList } from "./useBlockList";


export function useFilterBlockedContent<T extends { id_utilisateur?: number; userId?: number }>(
  items: T[]
): T[] {
  const { isUserBlocked } = useBlockList();


  return useMemo(() => {
    if (!items || items.length === 0) return items;

    return items.filter((item) => {
      const userId = item.id_utilisateur || item.userId;
      return !userId || !isUserBlocked(userId);
    });
  }, [items, isUserBlocked]);
}


export function useIsUserBlocked(userId: number | null | undefined): boolean {
  const { isUserBlocked } = useBlockList();

  return useMemo(() => {
    if (!userId) return false;
    return isUserBlocked(userId);
  }, [userId, isUserBlocked]);
}
