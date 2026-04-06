import { createBrowserClient } from '@supabase/ssr';
import { assertSupabaseBrowserEnv, hasSupabaseBrowserEnv } from './env';

let browserClient;

export function getSupabaseBrowserClient() {
    if (!hasSupabaseBrowserEnv()) return null;

    if (!browserClient) {
        const { url, anonKey } = assertSupabaseBrowserEnv();
        browserClient = createBrowserClient(url, anonKey);
    }

    return browserClient;
}
