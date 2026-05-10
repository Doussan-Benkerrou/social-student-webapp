import type { SupabaseClient } from "@supabase/supabase-js";

export async function verifyCurrentPassword(
    supabase: SupabaseClient,
    email: string,
    currentPassword: string
) {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
    });

    if (error) throw error;
}

export async function updateAuthenticatedUserEmail(
    supabase: SupabaseClient,
    email: string
) {
    const { data, error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
    return data.user;
}

export async function updateAuthenticatedUserPassword(
    supabase: SupabaseClient,
    password: string
) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
}

export async function signOutCurrentUser(supabase: SupabaseClient) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}
