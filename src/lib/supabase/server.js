import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { assertSupabaseBrowserEnv } from './env';

export async function getSupabaseServerClient() {
    const cookieStore = await cookies();
    const { url, anonKey } = assertSupabaseBrowserEnv();

    return createServerClient(url, anonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll() {
                // Server Components only need read access here.
            }
        }
    });
}
