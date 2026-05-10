"use client";

import React from "react";
import { useFilterBlockedContent } from "@/hooks/useFilterBlockedContent";
import { useIsUserBlocked } from "@/hooks/useFilterBlockedContent";
import Avatar from "@/components/ui/Avatar";
import { getSafeInitials, getSafeText } from "@/lib/utils";
import { MessageCircle, Lock } from "lucide-react";

interface SearchUser {
  id_utilisateur: number;
  prenom: string;
  nom: string;
  photo_profile: string | null;
  filiere?: string;
  niveau_etude?: string;
}


interface SearchUsersResultProps {
  users: SearchUser[];
  isLoading?: boolean;
  onUserClick?: (userId: number) => void;
  onMessageClick?: (userId: number) => void;
}


const SearchUsersResult = React.memo(
  ({ users, isLoading = false, onUserClick, onMessageClick }: SearchUsersResultProps) => {
    const filteredUsers = useFilterBlockedContent(users);

    if (isLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      );
    }

    if (!filteredUsers || filteredUsers.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-slate-500">Aucun utilisateur trouvé</p>
          <p className="text-xs text-slate-400 mt-1">
            Les utilisateurs bloqués n&apos;apparaissent pas dans les résultats
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <SearchUserCard
            key={user.id_utilisateur}
            user={user}
            onUserClick={onUserClick}
            onMessageClick={onMessageClick}
          />
        ))}
      </div>
    );
  }
);

SearchUsersResult.displayName = "SearchUsersResult";

function SearchUserCard({
  user,
  onUserClick,
  onMessageClick,
}: {
  user: SearchUser;
  onUserClick?: (userId: number) => void;
  onMessageClick?: (userId: number) => void;
}) {
  const isBlocked = useIsUserBlocked(user.id_utilisateur);

  return (
    <div
      className="p-3 rounded-lg border border-slate-200 hover:border-brand-300 bg-white hover:bg-slate-50 transition-all cursor-pointer group"
      onClick={() => onUserClick?.(user.id_utilisateur)}
    >
      <div className="flex items-center justify-between">
        {/* Infos utilisateur */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar
            initials={getSafeInitials(user.prenom, user.nom)}
            src={user.photo_profile}
            size="md"
            color="from-brand-400 to-brand-700"
          />

          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 truncate group-hover:text-brand-600 transition-colors">
              {getSafeText(user.prenom)} {getSafeText(user.nom)}
            </p>

            {(user.filiere || user.niveau_etude) && (
              <p className="text-xs text-slate-500 truncate">
                {user.filiere && getSafeText(user.filiere)}
                {user.filiere && user.niveau_etude ? " • " : ""}
                {user.niveau_etude && getSafeText(user.niveau_etude)}
              </p>
            )}
          </div>
        </div>

        {isBlocked && (
          <div className="ml-3 flex items-center gap-1 px-2 py-1 bg-red-50 rounded text-red-600 text-xs font-medium">
            <Lock size={12} />
            Bloqué
          </div>
        )}

        {!isBlocked && onMessageClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMessageClick(user.id_utilisateur);
            }}
            className="ml-3 p-2 rounded-md hover:bg-brand-100 text-brand-600 transition-colors"
            title="Envoyer un message"
          >
            <MessageCircle size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchUsersResult;
