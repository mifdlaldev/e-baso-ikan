function isConfiguredValue(value) {
    return Boolean(value && !String(value).startsWith('your-'));
}

export function getSupabaseEnv() {
    return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    };
}

export function hasSupabaseBrowserEnv() {
    const { url, anonKey } = getSupabaseEnv();
    return isConfiguredValue(url) && isConfiguredValue(anonKey);
}

export function assertSupabaseBrowserEnv() {
    const { url, anonKey } = getSupabaseEnv();

    if (!url || !anonKey) {
        throw new Error('Supabase environment variables are missing. Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.');
    }

    return { url, anonKey };
}

export function hasSupabaseAdminEnv() {
    const { url, serviceRoleKey } = getSupabaseEnv();
    return isConfiguredValue(url) && isConfiguredValue(serviceRoleKey);
}

export function assertSupabaseAdminEnv() {
    const { url, serviceRoleKey } = getSupabaseEnv();

    if (!url || !serviceRoleKey) {
        throw new Error('Supabase admin environment variables are missing. Fill NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.');
    }

    return { url, serviceRoleKey };
}
