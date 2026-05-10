"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    fetchUnreadNotificationsCount,
    subscribeToCurrentUserNotifications,
} from "@/services/notificationClientService";

export function useUnreadNotifications(userId: number | undefined) {
    const supabase = useMemo(() => createClient(), []);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        if (!userId) { setUnreadNotifications(0); return; }

        let active = true;

        const loadUnread = async () => {
            try {
                const count = await fetchUnreadNotificationsCount(supabase, Number(userId));
                if (active) setUnreadNotifications(count);
            } catch {
                if (active) setUnreadNotifications(0);
            }
        };

        void loadUnread();

        const channel = subscribeToCurrentUserNotifications(
            supabase,
            Number(userId),
            () => { void loadUnread(); }
        );

        return () => {
            active = false;
            void supabase.removeChannel(channel);
        };
    }, [supabase, userId]);

    return { unreadNotifications };
}