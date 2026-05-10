import {
    DISPLAY_FALLBACK,
    GROUP_COLORS,
    GroupeUI,
    MemberItem,
    PublicationItem,
    ResponseType,
    SignaleItem,
    Discussion
} from "./types";

export function getSafeText(value?: string | null, fallback: string = DISPLAY_FALLBACK): string {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
}

export function getSafeArray<T>(value?: T[] | null): T[] {
    return Array.isArray(value) ? value : [];
}

export function getSafeInitials(...values: Array<string | null | undefined>): string {
    const initials = values
        .map((value) => getSafeText(value, ""))
        .filter(Boolean)
        .map((value) => value[0]?.toUpperCase() ?? "")
        .join("");

    return initials || DISPLAY_FALLBACK;
}

export function getListErrorResponse<T>(message: string, data: T[] = []): ResponseType<T[]> {
    return {
        success: false,
        message,
        data,
    };
}

export function getNestedGroupsPayloadError(message: string): ResponseType<{ groups: any[]; pendingGroupIds: number[] }> {
    return {
        success: false,
        message,
        data: {
            groups: [],
            pendingGroupIds: [],
        },
    };
}

export function normalizeSuggestion(g: any): GroupeUI {
    return {
        id: Number(g?.id_groupe ?? 0),
        nom: getSafeText(g?.nom_groupe),
        description: getSafeText(g?.description, ""),
        type: getSafeText(g?.type_grp),
        photo: g?.photo_groupe ?? null,
        color: GROUP_COLORS[Math.abs(Number(g?.id_groupe ?? 0)) % GROUP_COLORS.length],
        initials: getSafeInitials(g?.nom_groupe),
        membres: Number(g?.membres_count ?? 0),
    };
}

export function normalizeGroup(memberRecord: any): GroupeUI {
    const g = memberRecord?.groupe ?? {};

    return {
        id: Number(g?.id_groupe ?? 0),
        nom: getSafeText(g?.nom_groupe),
        description: getSafeText(g?.description, ""),
        type: getSafeText(g?.type_grp),
        photo: g?.photo_groupe ?? null,
        color: GROUP_COLORS[Math.abs(Number(g?.id_groupe ?? 0)) % GROUP_COLORS.length],
        initials: getSafeInitials(g?.nom_groupe),
        membres: Number(g?.membre?.[0]?.count ?? 0),
        role: getSafeText(memberRecord?.role, "membre"),
    };
}


export function normalizeDetail(g: any, memberCount: number): GroupeUI {
    return {
        id: Number(g?.id_groupe ?? 0),
        nom: getSafeText(g?.nom_groupe),
        description: getSafeText(g?.description, ""),
        type: getSafeText(g?.type_grp),
        photo: g?.photo_groupe ?? null,
        color: GROUP_COLORS[Math.abs(Number(g?.id_groupe ?? 0)) % GROUP_COLORS.length],
        initials: getSafeInitials(g?.nom_groupe),
        membres: Number(memberCount ?? 0),
    };
}

export function normalizeMember(record: any): MemberItem {
    const u = record?.utilisateur ?? {};

    return {
        id_utilisateur: Number(u?.id_utilisateur ?? 0),
        nom: getSafeText(u?.nom),
        prenom: getSafeText(u?.prenom),
        filiere: getSafeText(u?.filiere, DISPLAY_FALLBACK),
        annee_etude: getSafeText(u?.niveau_etude, "") || undefined,
        photo_profile: u?.photo_profile ?? null,
        role: getSafeText(record?.role, "membre"),
    };
}

export function formatDate(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function normalizeSignalisation(rawSignals: any, currentUserId?: number): SignaleItem | null {
    const signals = Array.isArray(rawSignals)
        ? rawSignals
        : rawSignals
            ? [rawSignals]
            : [];

    if (signals.length === 0) return null;

    const ownSignal = currentUserId
        ? signals.find((signal: any) => Number(signal?.id_utilisateur) === Number(currentUserId))
        : signals[0];

    if (!ownSignal?.motif_signale) return null;

    return {
        motif_signale: ownSignal.motif_signale,
    };
}

export function normalizePublications(
    record: any,
    pubsReagies: Set<number>,
    pubsFavoris: Set<number>,
    currentUserId?: number
): PublicationItem {
    return {
        id_publication: Number(record?.id_publication ?? 0),
        contenu: getSafeText(record?.contenu, ""),
        date_publication: formatDate(record?.date_publication),
        est_anonyme: Boolean(record?.est_anonyme),
        categorie: record?.categorie,
        groupe: record?.groupe,
        nombre_reactions: Number(record?.reactions?.[0]?.count ?? 0),
        nombre_commentaires: Number(record?.commentaires?.[0]?.count ?? 0),
        a_reagir: pubsReagies.has(Number(record?.id_publication ?? 0)),
        a_favoris: pubsFavoris.has(Number(record?.id_publication ?? 0)),
        auteur: record?.auteur,
        medias: getSafeArray(record?.medias),
        signalisations: normalizeSignalisation(record?.signalisations, currentUserId),
    };
}


export function formatRelativeDate(value: string | Date): string {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "Date inconnue";

    const diffMs = date.getTime() - Date.now();
    const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
    const divisions: Array<[Intl.RelativeTimeFormatUnit, number]> = [
        ["year", 1000 * 60 * 60 * 24 * 365],
        ["month", 1000 * 60 * 60 * 24 * 30],
        ["day", 1000 * 60 * 60 * 24],
        ["hour", 1000 * 60 * 60],
        ["minute", 1000 * 60],
        ["second", 1000],
    ];

    for (const [unit, amount] of divisions) {
        if (Math.abs(diffMs) >= amount || unit === "second") {
            return rtf.format(Math.round(diffMs / amount), unit);
        }
    }

    return "À l’instant";
}


export const INVITATION_EVENT = "invitation:change";

export function setInvitationsBadge(total: number) {
    window.dispatchEvent(
        new CustomEvent<{ total: number }>(INVITATION_EVENT, { detail: { total } })
    );
}


export function getDiscussionPhoto(discussion: Discussion, currentUserId: number): string | null {
    if (discussion.id_groupe !== null) return discussion.groupe?.photo_groupe ?? null;
    const other = discussion.id_user1 === currentUserId ? discussion.user2 : discussion.user1;
    return other?.photo_profile ?? null;
}

export function parseDate(dateStr: string | Date | undefined | null): Date | null {
  if (!dateStr) {
    return null
  }
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr
  }
    
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

export function formatTime(dateStr: string | Date | undefined | null): string {
  const date = parseDate(dateStr)
  if (!date) {
    return ''
  }

  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}