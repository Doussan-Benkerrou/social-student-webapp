"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserContext, type Utilisateur } from "./useUser";


export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Utilisateur | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        const supabase = createClient();
        setLoading(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.getUser();

            if (authError || !authData?.user) {
                setUser(null);
                return;
            }

            const { data: userData, error: userError } = await supabase
                .from("utilisateur")
                .select("*")
                .eq("auth_id", authData.user.id)
                .single();

            if (userError) {
                console.error("Erreur récupération utilisateur :", userError);
                setUser(null);
            } else {
                setUser((prev) => {
                    if (prev?.id_utilisateur === userData?.id_utilisateur) return prev;
                    return userData;
                });
            }
        } catch (err) {
            console.error("Erreur UserProvider :", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const supabase = createClient();

        fetchUser();

        const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
            if (
                event === "SIGNED_IN" ||
                event === "SIGNED_OUT" ||
                event === "USER_UPDATED"
            ) {
                fetchUser();
            }
        });

        return () => {
            subscription?.subscription?.unsubscribe();
        };
    }, [fetchUser]);

    return (
        <UserContext.Provider value={{ user, loading, refresh: fetchUser }}>
            {children}
        </UserContext.Provider>
    );
}