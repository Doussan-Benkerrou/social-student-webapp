"use server"

import { createClient } from "@/lib/supabase/server"

type NotificationInput = {
    type_notif: string;
    contenu_notif: string;
    id_utilisateur: number;
    id_publication?: number | null;
    id_commentaire?: number | null;
    id_reaction?: number | null;
    id_message?: number | null;
    id_invitation?: number | null;
};

export async function createNotification(input: NotificationInput): Promise<void> {
    try {
        const supabase = await createClient();
        await supabase.from("notification").insert({
            type_notif: input.type_notif,
            contenu_notif: input.contenu_notif,
            id_utilisateur: input.id_utilisateur,
            id_publication: input.id_publication ?? null,
            id_commentaire: input.id_commentaire ?? null,
            id_reaction: input.id_reaction ?? null,
            id_message: input.id_message ?? null,
            id_invitation: input.id_invitation ?? null,
        });
    } catch {
        // Notification failure should not break the main action
    }
}
