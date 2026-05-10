"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ElementType } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeDate } from "@/lib/utils";
import type { AppNotification } from "@/lib/types";
import {
    fetchNotificationsForUserId,
    markAllNotificationsReadForUser,
    markNotificationAsRead,
    subscribeToCurrentUserNotifications,
} from "@/services/notificationClientService";
import {
    Heart,
    MessageCircle,
    Users,
    Mail,
    UserPlus,
    Flag,
    BellOff,
    Check,
    Loader2,
    RefreshCw,
} from "lucide-react";

const ICON_MAP: Record<string, ElementType> = {
    reaction: Heart,
    commentaire: MessageCircle,
    comment: MessageCircle,
    invitation: Users,
    message: Mail,
    adhesion: UserPlus,
    join: UserPlus,
    signalement: Flag,
};

const COLOR_MAP: Record<string, string> = {
    reaction: "from-red-400 to-rose-500",
    commentaire: "from-sky-400 to-blue-500",
    comment: "from-sky-400 to-blue-500",
    invitation: "from-violet-400 to-purple-500",
    message: "from-brand-400 to-brand-600",
    adhesion: "from-emerald-400 to-teal-500",
    join: "from-emerald-400 to-teal-500",
    signalement: "from-amber-400 to-orange-500",
};

type NotificationsClientProps = {
    currentUserId: number;
};

export default function NotificationsClient({ currentUserId }: NotificationsClientProps) {
    const supabase = useMemo(() => createClient(), []);
    const [notifs, setNotifs] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const subscriptionRef = useRef<ReturnType<typeof subscribeToCurrentUserNotifications> | null>(null);

    const unread = notifs.filter((notif) => !notif.etat_notif).length;

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const nextNotifications = await fetchNotificationsForUserId(supabase, currentUserId);
            setNotifs(nextNotifications);

            if (!subscriptionRef.current) {
                subscriptionRef.current = subscribeToCurrentUserNotifications(
                    supabase,
                    currentUserId,
                    () => {
                        void loadNotifications();
                    }
                );
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Impossible de charger vos notifications.");
        } finally {
            setLoading(false);
        }
    }, [currentUserId, supabase]);

    useEffect(() => {
        void loadNotifications();
        return () => {
            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = null;
        };
    }, [loadNotifications]);

    async function handleMarkAllRead() {
        try {
            setMarkingAll(true);
            await markAllNotificationsReadForUser(supabase, currentUserId);
            await loadNotifications();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Impossible de marquer les notifications comme lues.");
        } finally {
            setMarkingAll(false);
        }
    }

    async function handleNotificationClick(notification: AppNotification) {
        if (notification.etat_notif) return;

        setNotifs((current) =>
            current.map((entry) =>
                entry.id_notif === notification.id_notif
                    ? { ...entry, etat_notif: true }
                    : entry
            )
        );

        try {
            await markNotificationAsRead(supabase, notification.id_notif);
        } catch {
            setNotifs((current) =>
                current.map((entry) =>
                    entry.id_notif === notification.id_notif
                        ? { ...entry, etat_notif: false }
                        : entry
                )
            );
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="font-display font-bold text-2xl text-slate-900">Notifications</h1>
                    {unread > 0 && (
                        <p className="text-sm text-slate-500 font-body mt-0.5">
                            <span className="text-brand-600 font-semibold">{unread}</span> non lues
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => void loadNotifications()}
                        className="btn-secondary py-2 text-xs flex items-center gap-1.5"
                        disabled={loading}
                    >
                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                        Actualiser
                    </button>
                    {unread > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="btn-secondary py-2 text-xs flex items-center gap-1.5"
                            disabled={markingAll}
                        >
                            {markingAll ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                            Tout marquer lu
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="card border-rose-100 bg-rose-50/70 p-4">
                    <p className="font-display font-semibold text-sm text-rose-700">{error}</p>
                </div>
            )}

            <div className="card divide-y divide-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center space-y-3">
                        <Loader2 className="w-8 h-8 text-brand-500 mx-auto animate-spin" />
                        <p className="font-display font-semibold text-slate-600">Chargement des notifications...</p>
                    </div>
                ) : notifs.length === 0 ? (
                    <div className="p-12 text-center">
                        <BellOff className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="font-display font-semibold text-slate-500">Aucune notification</p>
                        <p className="text-sm font-body text-slate-400 mt-1">Vos nouvelles alertes apparaîtront ici.</p>
                    </div>
                ) : (
                    notifs.map((notif) => {
                        const typeKey = notif.type_notif.toLowerCase();
                        const Icon = ICON_MAP[typeKey] ?? BellOff;
                        const color = COLOR_MAP[typeKey] ?? "from-slate-400 to-slate-500";

                        return (
                            <button
                                key={notif.id_notif}
                                onClick={() => void handleNotificationClick(notif)}
                                className={`w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-slate-50 ${!notif.etat_notif ? "bg-brand-50/50" : ""}`}
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-sm`}>
                                    <Icon size={16} className="text-white" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-body ${!notif.etat_notif ? "text-slate-800 font-medium" : "text-slate-600"}`}>
                                        {notif.contenu_notif}
                                    </p>
                                    <p className="text-xs text-slate-400 font-body mt-0.5">{formatRelativeDate(notif.date_notif)}</p>
                                </div>

                                {!notif.etat_notif && <div className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
