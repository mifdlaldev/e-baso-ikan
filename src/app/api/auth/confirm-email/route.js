import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

async function findUserByEmail(supabase, email) {
    const pageSize = 200;
    let page = 1;

    while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({
            page,
            perPage: pageSize
        });

        if (error) {
            return { error };
        }

        const matchedUser = data.users.find((user) => user.email?.toLowerCase() === email);
        if (matchedUser) {
            return { user: matchedUser };
        }

        if (data.users.length < pageSize) {
            break;
        }

        page += 1;
    }

    return { user: null };
}

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

    if (!email) {
        return NextResponse.json(
            { error: 'Email wajib diisi.' },
            { status: 400 }
        );
    }

    const { user, error: lookupError } = await findUserByEmail(supabase, email);

    if (lookupError) {
        return NextResponse.json(
            { error: lookupError.message },
            { status: 400 }
        );
    }

    if (!user) {
        return NextResponse.json(
            { error: 'Akun tidak ditemukan.' },
            { status: 404 }
        );
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true
    });

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }

    return NextResponse.json({
        success: true,
        userId: user.id
    });
}
