import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request) {
    const supabase = getSupabaseAdminClient();

    if (!supabase) {
        return NextResponse.json(
            { error: 'Supabase admin belum dikonfigurasi di server.' },
            { status: 500 }
        );
    }

    const body = await request.json().catch(() => null);
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;
    const fullName = body?.fullName?.trim();

    if (!email || !password) {
        return NextResponse.json(
            { error: 'Email dan password wajib diisi.' },
            { status: 400 }
        );
    }

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: fullName || null
        }
    });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }

    return NextResponse.json({
        user: {
            id: data.user?.id,
            email: data.user?.email
        }
    });
}
