"use client";
import { MessageCircle, UserPlus, Clock, Users, Trash2 } from "lucide-react";
import { GroupeWithMeta,ResponseType } from "@/lib/types";
import Image from "next/image"


const GRADIENT_COLORS = [
  "from-violet-500 to-violet-700",
  "from-brand-500 to-brand-700",
  "from-rose-500 to-rose-700",
  "from-teal-500 to-teal-700",
  "from-sky-500 to-sky-700",
  "from-amber-500 to-amber-700",
  "from-indigo-500 to-indigo-700",
  "from-pink-500 to-pink-700",
];

function getColor(id: number) {
  return GRADIENT_COLORS[id % GRADIENT_COLORS.length];
}

function getInitials(nom: string) {
  return nom
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Props = {
  curUser : ResponseType;
  groupe: GroupeWithMeta;
  mode: "my" | "discover";
  onViewDiscussion: (id_groupe: number) => void | Promise<void>;
  onJoin: (id_groupe: number) => void;
  onInvite?: (id_groupe: number) => void;
  onDelete? : (id_groupe : number) => void;
};

export default function CommunityCard({
  curUser,
  groupe,
  mode,
  onViewDiscussion,
  onJoin,
  onInvite,
  onDelete,
}: Props) {
  const color = getColor(groupe.id_groupe);
  const initials = groupe.photo_groupe ? null : getInitials(groupe.nom_groupe);

  return (
    <div className="card-hover p-5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden
            ${groupe.photo_groupe ? "" : `bg-gradient-to-br ${color}`}`}
        >
          {groupe.photo_groupe ? (
            <Image
              src={groupe.photo_groupe}
              alt={groupe.nom_groupe}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-white font-display font-bold text-base">
              {initials}
            </span>
          )}
        </div>

        {/* info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-display font-bold text-base text-slate-900 truncate">
              {groupe.nom_groupe}
            </p>
            <span className="chip bg-violet-100 text-violet-700 text-[10px]">
              Communauté
            </span>
          </div>
          {groupe.description && (
            <p className="text-xs text-slate-500 font-body mb-2 line-clamp-2">
              {groupe.description}
            </p>
          )}
          <p className="text-xs text-slate-400 font-body flex items-center gap-1">
            <Users size={11} /> {groupe.nombreMembres} membre
            {groupe.nombreMembres !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
        {mode === "my" ? (
          <>
            <button
              onClick={() => onViewDiscussion(groupe.id_groupe)}
              className="btn-primary flex-1 justify-center py-2 text-xs"
            >
              <MessageCircle size={13} /> Voir la discussion
            </button>
            
            {groupe.isAdmin && onInvite && (
              <>
                <button
                  onClick={() => onInvite(groupe.id_groupe)}
                  className="btn-secondary py-2 px-3 text-xs"
                  title="Inviter des personnes"
                >
                  <UserPlus size={13} />
                </button>


                {onDelete && (
                  <button 
                    onClick={() => onDelete(groupe.id_groupe)}
                    title='Supprimer la communauté'>
                      <Trash2 size={18} />
                  </button>
                )}
              </>
            )}
          </>
        ) : groupe.pendingRequest ? (
          <button
            disabled
            className="btn-secondary flex-1 justify-center py-2 text-xs text-slate-400 cursor-not-allowed"
          >
            <Clock size={12} /> En attente d'acceptation
          </button>
        ) : (
          <button
            onClick={() => onJoin(groupe.id_groupe)}
            className="btn-primary flex-1 justify-center py-2 text-xs"
          >
            <UserPlus size={13} /> Rejoindre la communauté
          </button>
        )}
      </div>
    </div>
  );
}