"use client";

import React, { useMemo } from "react";
import { useBlockList } from "@/hooks/useBlockList";
import BlockedUserItem from "./BlockedUserItem";
import { Loader2, AlertCircle } from "lucide-react";


export default function BlockedUsersList() {
  const { blockedUsers, isLoading, error, unblock } = useBlockList();


  const sortedUsers = useMemo(() => {
    return [...blockedUsers].sort((a, b) => {
      return (
        new Date(b.date_blocage).getTime() -
        new Date(a.date_blocage).getTime()
      );
    });
  }, [blockedUsers]);

  if (isLoading && blockedUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 size={32} className="text-brand-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500">Chargement de la liste de blocage...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3">
        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-900">Erreur</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (sortedUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-300 mb-3">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-slate-600 font-medium">Aucun utilisateur bloqué</p>
        <p className="text-slate-400 text-sm">
          Les utilisateurs que vous bloquez apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Utilisateurs bloqués ({sortedUsers.length})
        </h3>
      </div>

      <div className="space-y-2">
        {sortedUsers.map((blockedUser) => (
          <BlockedUserItem
            key={blockedUser.id_bloque}
            id={blockedUser.id_bloque}
            prenom={blockedUser.utilisateur.prenom}
            nom={blockedUser.utilisateur.nom}
            photo_profile={blockedUser.utilisateur.photo_profile}
            onUnblock={unblock}
          />
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-4 px-1">
        Vous pouvez débloquer un utilisateur à tout moment. Les utilisateurs bloqués ne pourront pas
        voir vos publications ni vous envoyer des messages.
      </p>
    </div>
  );
}
