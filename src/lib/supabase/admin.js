import { createClient } from '@supabase/supabase-js';
import { assertSupabaseAdminEnv, hasSupabaseAdminEnv } from './env';

let adminClient;

export function getSupabaseAdminClient() {
    if (!hasSupabaseAdminEnv()) return null;

    if (!adminClient) {
        const { url, serviceRoleKey } = assertSupabaseAdminEnv();
        adminClient = createClient(url, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }

    return adminClient;
}
