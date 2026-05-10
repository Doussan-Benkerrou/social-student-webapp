import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { AppNotification } from "@/lib/types";

const NOTIFICATION_COLUMNS =
    "id_notif, type_notif, contenu_notif, date_notif, etat_notif, id_utilisateur, id_publication, id_commentaire, id_reaction, id_message, id_invitation";

export async function fetchNotificationsForUserId(
    supabase: SupabaseClient,
    userId: number
): Promise<AppNotification[]> {
    const { data, error } = await supabase
        .from("notification")
        .select(NOTIFICATION_COLUMNS)
        .eq("id_utilisateur", userId)
        .order("date_notif", { ascending: false });

    if (error) throw error;
    return (data ?? []) as AppNotification[];
}

export async function fetchUnreadNotificationsCount(
    supabase: SupabaseClient,
    userId: number
): Promise<number> {
    const { count, error } = await supabase
        .from("notification")
        .select("id_notif", { count: "exact", head: true })
        .eq("id_utilisateur", userId)
        .eq("etat_notif", false);

    if (error) throw error;
    return count ?? 0;
}

export async function markAllNotificationsReadForUser(
    supabase: SupabaseClient,
    userId: number
) {
    const { error } = await supabase
        .from("notification")
        .update({ etat_notif: true })
        .eq("id_utilisateur", userId)
        .eq("etat_notif", false);

    if (error) throw error;
}

export async function markNotificationAsRead(
    supabase: SupabaseClient,
    notificationId: number
) {
    const { error } = await supabase
        .from("notification")
        .update({ etat_notif: true })
        .eq("id_notif", notificationId);

    if (error) throw error;
}

function makeNotificationChannelName(currentUserId: number): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return `notifications:${currentUserId}:${crypto.randomUUID()}`;
    }

    return `notifications:${currentUserId}:${Date.now()}:${Math.random()
        .toString(36)
        .slice(2)}`;
}

export function subscribeToCurrentUserNotifications(
    supabase: SupabaseClient,
    currentUserId: number,
    onChange: () => void
): RealtimeChannel {
    const channel = supabase.channel(makeNotificationChannelName(currentUserId));

    channel.on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table: "notification",
            filter: `id_utilisateur=eq.${currentUserId}`,
        },
        () => {
            onChange();
        }
    );

    channel.subscribe();
    return channel;
}
