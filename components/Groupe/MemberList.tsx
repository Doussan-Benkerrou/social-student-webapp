"use client"

import { UserMinus } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { MemberItem } from "@/lib/types";
import { getSafeInitials, getSafeText } from "@/lib/utils";

interface Props {
    members: MemberItem[];
    isAdmin: boolean;
    onRemoveMember: (idUser: number) => void;
}

export default function MembersList({ members, isAdmin, onRemoveMember }: Props) {
    if (!members.length) {
        return (
            <div className="card p-12 text-center">
                <p className="text-slate-400 font-body">Aucun membre.</p>
            </div>
        );
    }

    return (
        <div className="card divide-y divide-slate-100">
            {members.map((member) => (
                <div
                    key={member.id_utilisateur}
                    className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
                >
                    <Avatar
                        src={member.photo_profile ?? null}
                        initials={getSafeInitials(member.prenom, member.nom)}
                        color="bg-slate-200"
                        size="sm"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-sm text-slate-800">
                            {getSafeText(member.prenom)} {getSafeText(member.nom)}
                        </p>
                        <p className="text-xs text-slate-400 font-body">
                            {getSafeText(member.filiere)}
                            {member.annee_etude ? ` · ${member.annee_etude}` : ""}
                        </p>
                    </div>

                    {member.role === "admin" && (
                        <span className="chip bg-amber-100 text-amber-700">Administrateur</span>
                    )}

                    {isAdmin && member.role !== "admin" && (
                        <button
                            onClick={() => onRemoveMember(member.id_utilisateur)}
                            className="btn-icon text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                            <UserMinus size={15} />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
