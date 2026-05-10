import { createClient } from "@/lib/supabase/client";
import { isBlocked } from "./blocageService";
import type { Discussion, Message, UtilisateurBref, GroupeBref } from "@/lib/types";


const DISCUSSION_SELECT = `
    *,
    message(*),
    user1:id_user1(id_utilisateur, nom, prenom, photo_profile),
    user2:id_user2(id_utilisateur, nom, prenom, photo_profile),
    groupe:id_groupe(id_groupe, nom_groupe, photo_groupe)
`;



function normalizeDiscussion(raw: any): Discussion {
    return {
        ...raw,
        messages: Array.isArray(raw.message) ? raw.message : (raw.messages ?? []),
        user1:    raw.user1   ?? null,
        user2:    raw.user2   ?? null,
        groupe:   raw.groupe  ?? null,
    };
}


export function getDiscussionDisplayName(discussion: Discussion, currentUserId: number): string {
    if (discussion.id_groupe !== null) return discussion.groupe?.nom_groupe ?? "Groupe";
    const other = discussion.id_user1 === currentUserId ? discussion.user2 : discussion.user1;
    if (!other) return "Utilisateur inconnu";
    return `${other.prenom} ${other.nom}`;
}

export function getDiscussionInitials(discussion: Discussion, currentUserId: number): string {
    if (discussion.id_groupe !== null) {
        const nom = discussion.groupe?.nom_groupe ?? "G";
        return nom.slice(0, 2).toUpperCase();
    }
    const other = discussion.id_user1 === currentUserId ? discussion.user2 : discussion.user1;
    if (!other) return "??";
    return `${other.prenom[0]}${other.nom[0]}`.toUpperCase();
}


export async function getDiscussionById(id_discussion: number): Promise<Discussion | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("discussion").select(DISCUSSION_SELECT)
        .eq("id_discussion", id_discussion).single();
    if (error) { console.error("getDiscussionById:", error.message); return null; }
    return normalizeDiscussion(data);
}


export async function getDiscussionsByUser(id_user: number): Promise<Discussion[]> {
    const supabase = createClient();

    const { data: memberships } = await supabase
        .from("membre").select("id_groupe")
        .eq("id_utilisateur", id_user).is("date_quitte", null);

    const groupeIds = (memberships ?? []).map((m: any) => m.id_groupe);

    let query = supabase
        .from("discussion").select(DISCUSSION_SELECT)
        .order("date_creation", { ascending: false });

    if (groupeIds.length > 0) {
        query = query.or(
            `id_user1.eq.${id_user},id_user2.eq.${id_user},id_groupe.in.(${groupeIds.join(",")})`
        );
    } else {
        query = query.or(`id_user1.eq.${id_user},id_user2.eq.${id_user}`);
    }

    const { data, error } = await query;
    if (error) { console.error("getDiscussionsByUser:", error.message); return []; }
    return (data ?? []).map(normalizeDiscussion);
}



export async function getDiscussionByGroup(id_group: number): Promise<Discussion | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("discussion").select(DISCUSSION_SELECT).eq("id_groupe", id_group).single();
    if (error) { console.error("getDiscussionByGroup:", error.message); return null; }
    return normalizeDiscussion(data);
}

export async function createPrivateDiscussion(id_user1: number, id_user2: number): Promise<Discussion | null> {
    const supabase = createClient();
    const { data: existing } = await supabase
        .from("discussion").select("id_discussion")
        .or(`and(id_user1.eq.${id_user1},id_user2.eq.${id_user2}),and(id_user1.eq.${id_user2},id_user2.eq.${id_user1})`)
        .maybeSingle();
    if (existing) return null;

    const { data, error } = await supabase
        .from("discussion").insert({ id_user1, id_user2, id_groupe: null })
        .select(DISCUSSION_SELECT).single();
    if (error) { console.error("createPrivateDiscussion:", error.message); return null; }
    return normalizeDiscussion(data);
}

export async function getOrCreatePrivateDiscussion(id_user1: number, id_user2: number): Promise<Discussion | null> {
    const supabase = createClient();
    const { data: existing } = await supabase
        .from("discussion").select("id_discussion")
        .or(`and(id_user1.eq.${id_user1},id_user2.eq.${id_user2}),and(id_user1.eq.${id_user2},id_user2.eq.${id_user1})`)
        .maybeSingle();

    if (existing?.id_discussion) return getDiscussionById(existing.id_discussion);
    return createPrivateDiscussion(id_user1, id_user2);
}

export async function createGroupDiscussion(id_groupe: number): Promise<Discussion | null> {
    const supabase = createClient();
    const { data: existing } = await supabase
        .from("discussion").select("id_discussion").eq("id_groupe", id_groupe).maybeSingle();
    if (existing) return null;

    const { data, error } = await supabase
        .from("discussion").insert({ id_groupe, id_user1: null, id_user2: null })
        .select(DISCUSSION_SELECT).single();
    if (error) { console.error("createGroupDiscussion:", error.message); return null; }
    return normalizeDiscussion(data);
}

export async function canAccessDiscussion(id_discussion: number, id_requester: number): Promise<boolean> {
    const supabase = createClient();
    const { data: discussion, error } = await supabase
        .from("discussion").select("id_user1, id_user2, id_groupe")
        .eq("id_discussion", id_discussion).single();

    if (error || !discussion) return false;

    if (discussion.id_groupe === null) {
        const isParticipant = discussion.id_user1 === id_requester || discussion.id_user2 === id_requester;
        if (!isParticipant) return false;
        const blockRow = await isBlocked(discussion.id_user1, discussion.id_user2);
        return !blockRow;
    }

    const { data: membre, error: membreError } = await supabase
        .from("membre").select("id_utilisateur")
        .eq("id_groupe", discussion.id_groupe).eq("id_utilisateur", id_requester)
        .is("date_quitte", null).maybeSingle();

    if (membreError) return false;
    return membre !== null;
}



export async function deleteDiscussion(id_discussion: number, id_requester: number): Promise<boolean> {
    const allowed = await canAccessDiscussion(id_discussion, id_requester);
    if (!allowed) return false;
    const supabase = createClient();
    const { error } = await supabase.from("discussion").delete().eq("id_discussion", id_discussion);
    if (error) { console.error("deleteDiscussion:", error.message); return false; }
    return true;
}