import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

// Un seul client pour tout le side client de l'app.
// createClient() de Supabase est idempotent si appelé une fois,
// mais rien ne l'empêche de créer N instances — on le force ici.
let instance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
    if (!instance) {
        instance = createClient()
    }
    return instance
}