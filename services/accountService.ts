import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function deleteUserApplicationData(
    adminClient: SupabaseClient,
    authId: string
) {
    const { error } = await adminClient.from("utilisateur").delete().eq("auth_id", authId);

    if (error) throw error;
}

export async function deleteSupabaseAuthUser(
    adminClient: SupabaseClient,
    authId: string
) {
    const { error } = await adminClient.auth.admin.deleteUser(authId);

    if (error) throw error;
}
