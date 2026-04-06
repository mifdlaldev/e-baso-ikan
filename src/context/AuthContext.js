'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { hasSupabaseBrowserEnv } from '../lib/supabase/env';

const AuthContext = createContext();

async function fetchProfile(supabase, userId) {
    if (!supabase || !userId) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, avatar_url, phone, is_active')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.warn('Failed to fetch profile from Supabase:', error.message);
        return null;
    }

    return data;
}

async function parseJsonResponse(response) {
    const data = await response.json().catch(() => ({}));

    return {
        ok: response.ok,
        status: response.status,
        data
    };
}

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(() => hasSupabaseBrowserEnv());

    useEffect(() => {
        const supabase = getSupabaseBrowserClient();

        if (!supabase) {
            return undefined;
        }

        let isMounted = true;

        const syncAuthState = async (nextSession) => {
            if (!isMounted) return;

            setSession(nextSession);

            if (!nextSession?.user) {
                setProfile(null);
                setLoading(false);
                return;
            }

            const nextProfile = await fetchProfile(supabase, nextSession.user.id);

            if (!isMounted) return;

            setProfile(nextProfile);
            setLoading(false);
        };

        supabase.auth.getSession()
            .then(({ data }) => syncAuthState(data.session))
            .catch((error) => {
                console.warn('Failed to restore auth session:', error.message);
                if (isMounted) setLoading(false);
            });

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            void syncAuthState(nextSession);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async ({ email, password }) => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            return { error: new Error('Supabase belum dikonfigurasi di environment.') };
        }

        const initialResult = await supabase.auth.signInWithPassword({ email, password });

        if (!initialResult.error || !initialResult.error.message?.includes('Email not confirmed')) {
            return initialResult;
        }

        const confirmResponse = await fetch('/api/auth/confirm-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        const confirmation = await parseJsonResponse(confirmResponse);

        if (!confirmation.ok) {
            return initialResult;
        }

        return supabase.auth.signInWithPassword({ email, password });
    };

    const signUp = async ({ email, password, fullName }) => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            return { error: new Error('Supabase belum dikonfigurasi di environment.') };
        }

        const registerResponse = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                fullName
            })
        });
        const registration = await parseJsonResponse(registerResponse);

        if (!registration.ok) {
            return {
                data: {
                    user: null,
                    session: null
                },
                error: new Error(registration.data?.error || 'Gagal membuat akun baru.')
            };
        }

        return supabase.auth.signInWithPassword({ email, password });
    };

    const signOut = async () => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
            return { error: new Error('Supabase belum dikonfigurasi di environment.') };
        }

        const result = await supabase.auth.signOut();

        if (!result.error) {
            setSession(null);
            setProfile(null);
        }

        return result;
    };

    const value = useMemo(() => ({
        session,
        user: session?.user ?? null,
        profile,
        loading,
        isAuthenticated: Boolean(session?.user),
        isAdmin: profile?.role === 'admin' && profile?.is_active !== false,
        signIn,
        signUp,
        signOut
    }), [loading, profile, session]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
