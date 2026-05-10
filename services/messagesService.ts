import { getSupabaseClient } from "@/lib/supabase/singleton";
import { canAccessDiscussion } from "./discussionService";
import type { Message } from "@/lib/types";

function getSupabase() {
    return getSupabaseClient();
}

const accessCache = new Map<string, boolean>();

export function clearAccessCache(id_discussion?: number) {
    if (id_discussion === undefined) {
        accessCache.clear();
    } else {
        for (const key of accessCache.keys()) {
            if (key.startsWith(`${id_discussion}:`)) accessCache.delete(key);
        }
    }
}

async function checkAccess(id_discussion: number, id_sender: number): Promise<boolean> {
    const key = `${id_discussion}:${id_sender}`;
    if (accessCache.has(key)) return accessCache.get(key)!;
    const result = await canAccessDiscussion(id_discussion, id_sender);
    accessCache.set(key, result);
    return result;
}

export async function getMessagesPaginated(
    id_discussion: number,
    page: number = 0,
    limit: number = 20
): Promise<Message[]> {
    const from = page * limit;
    const to   = from + limit - 1;

    const { data, error } = await getSupabase()
        .from("message")
        .select("*, utilisateur:id_sender(id_utilisateur, nom, prenom, photo_profile)")
        .eq("id_discussion", id_discussion)
        .order("date_message", { ascending: false })
        .range(from, to);

    if (error) { console.error("getMessagesPaginated:", error.message); return []; }

    return (data ?? []).map((m: any) => ({ ...m, senderInfo: m.utilisateur ?? null }));
}

export async function sendMessage(
    newMessage: Pick<Message, "content" | "id_sender" | "id_discussion">
): Promise<Message | null> {
    const canAccess = await checkAccess(newMessage.id_discussion, newMessage.id_sender);
    if (!canAccess) { console.error("sendMessage: accès refusé"); return null; }

    const { data, error } = await getSupabase()
        .from("message").insert(newMessage).select().single();

    if (error) { console.error("sendMessage:", error.message); return null; }
    return data;
}

export async function deleteMessage(id_message: number, id_sender: number): Promise<boolean> {
    const { data: messageOriginal, error: fetchError } = await getSupabase()
        .from("message").select("id_sender").eq("id_message", id_message).single();

    if (fetchError || !messageOriginal) return false;
    if (messageOriginal.id_sender !== id_sender) return false;

    const { error } = await getSupabase().from("message").delete().eq("id_message", id_message);
    if (error) { console.error("deleteMessage:", error.message); return false; }
    return true;
}

export async function markMessagesAsRead(id_discussion: number, id_lecteur: number): Promise<boolean> {
    const { error } = await getSupabase()
        .from("message").update({ is_read: true })
        .eq("id_discussion", id_discussion).neq("id_sender", id_lecteur).eq("is_read", false);

    if (error) { console.error("markMessagesAsRead:", error.message); return false; }
    return true;
}

export async function getUnreadMessagesCount(
    id_discussion: number,
    id_user: number
): Promise<number | null> {
    const canAccess = await canAccessDiscussion(id_discussion, id_user);
    if (!canAccess) return null;

    const { count, error } = await getSupabase()
        .from("message").select("*", { count: "exact", head: true })
        .eq("id_discussion", id_discussion).neq("id_sender", id_user).eq("is_read", false);

    if (error) { console.error("getUnreadMessagesCount:", error.message); return 0; }
    return count ?? 0;
}

export async function getTotalUnreadMessagesCount(id_user: number): Promise<number> {
    const { data: discussions, error: discussionsError } = await getSupabase()
        .from("discussion").select("id_discussion")
        .or(`id_user1.eq.${id_user},id_user2.eq.${id_user}`);

    if (discussionsError || !discussions?.length) return 0;

    const discussionIds = discussions.map((d) => d.id_discussion);
    const { count, error } = await getSupabase()
        .from("message").select("*", { count: "exact", head: true })
        .in("id_discussion", discussionIds).neq("id_sender", id_user).eq("is_read", false);

    if (error) { console.error("getTotalUnreadMessagesCount:", error.message); return 0; }
    return count ?? 0;
}