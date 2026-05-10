"use client";

import React, { useState } from "react";
import { Unlock } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { getSafeInitials, getSafeText } from "@/lib/utils";


interface BlockedUserItemProps {
  id: number;
  prenom: string;
  nom: string;
  photo_profile: string | null;
  onUnblock: (userId: number) => Promise<boolean>;
  isUnblocking?: boolean;
}


const BlockedUserItem = React.memo(
  ({
    id,
    prenom,
    nom,
    photo_profile,
    onUnblock,
    isUnblocking = false,
  }: BlockedUserItemProps) => {
    const [isLoading, setIsLoading] = useState(false);

    
    const handleUnblock = async () => {
      setIsLoading(true);
      try {
        await onUnblock(id);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar
            initials={getSafeInitials(prenom, nom)}
            src={photo_profile}
            size="md"
            color="from-brand-400 to-brand-700"
          />

          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 truncate">
              {getSafeText(prenom)} {getSafeText(nom)}
            </p>
          </div>
        </div>


        <button
          onClick={handleUnblock}
          disabled={isLoading || isUnblocking}
          className="ml-3 flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          title="Débloquer cet utilisateur"
        >
          <Unlock size={16} />
          {isLoading || isUnblocking ? "Déblocage..." : "Débloquer"}
        </button>
      </div>
    );
  }
);

BlockedUserItem.displayName = "BlockedUserItem";

export default BlockedUserItem;
