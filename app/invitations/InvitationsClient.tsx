"use client"

import { useEffect, useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { ResponseType } from "@/lib/types"
import { useToast } from "@/hooks/UseToast"
import ToastStack from "@/components/ui/ToastStack"
import { acceptInvitation, refuseInvitation } from "@/services/invitationService"
import { Mail } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import { getSafeInitials, getSafeText, setInvitationsBadge } from "@/lib/utils"

type Props = {
    curUser: ResponseType;
    initialInvitations: ResponseType;
};

export default function InvitationsClient({ curUser, initialInvitations }: Props) {
    const [invitations, setInvitations] = useState<any[]>(initialInvitations.data ?? [])
    const { toasts, showToast, hideToast } = useToast();

    const handleAccept = async (invitationId: number, idUtilisateur: number, idGroupe: number) => {
        const result = await acceptInvitation(invitationId, idUtilisateur, idGroupe);
        if (result.success) {
            showToast(result.message || "Invitation acceptée.", "success");
            setInvitations((prev) => prev.filter((i) => i.id_invitation !== invitationId));
            setInvitationsBadge(invitations.length);
        } else {
            showToast(result.message || "Erreur lors de l'acceptation.", "error");
        }
    };
    useEffect(() => {
        setInvitationsBadge(invitations.length);
    }, []);
    const handleRefuse = async (invitationId: number) => {
        const result = await refuseInvitation(invitationId);
        if (result.success) {
            showToast(result.message || "Invitation refusée.", "success");
            setInvitations((prev) => prev.filter((i) => i.id_invitation !== invitationId));
            setInvitationsBadge(invitations.length);
        } else {
            showToast(result.message || "Erreur lors du refus.", "error");
        }
    };

    return (
        <AppLayout curUser={curUser}>
            <ToastStack toasts={toasts} onClose={hideToast} />
            <div className="max-w-4xl mx-auto p-6 space-y-5">
                <div>
                    <h1 className="font-display font-bold text-2xl text-slate-900">Mes invitations</h1>
                    <p className="text-sm text-slate-500 font-body mt-0.5">
                        Gérez vos invitations reçues
                    </p>
                </div>

                {invitations.length === 0 ? (
                    <div className="card p-10 text-center">
                        <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 font-body text-sm">Aucune invitation pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {invitations.map((inv) => (
                            <div key={inv.id_invitation} className="card p-5 flex items-center gap-4">
                                <Avatar
                                    initials={getSafeInitials(inv.utilisateur_emetteur?.prenom, inv.utilisateur_emetteur?.nom)}
                                    src={inv.utilisateur_emetteur?.photo_profile ?? null}
                                    size="md"
                                    color="from-brand-400 to-brand-700"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-display font-semibold text-sm text-slate-800">
                                        {getSafeText(inv.utilisateur_emetteur?.nom)} {getSafeText(inv.utilisateur_emetteur?.prenom)}
                                    </p>
                                    <p className="text-xs text-slate-500 font-body">
                                        souhaite que vous rejoigniez{" "}
                                        <span className="font-semibold text-brand-600">
                                            {getSafeText(inv.groupe?.nom_groupe)}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(inv.id_invitation, inv.id_emetteur, inv.id_groupe)}
                                        className="btn-primary text-sm"
                                    >
                                        Accepter
                                    </button>
                                    <button
                                        onClick={() => handleRefuse(inv.id_invitation)}
                                        className="btn-secondary text-sm"
                                    >
                                        Refuser
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
