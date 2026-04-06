import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function requireAdminContext() {
    const supabase = await getSupabaseServerClient();
    const adminClient = getSupabaseAdminClient();

    if (!adminClient) {
        return {
            error: NextResponse.json(
                { error: 'Supabase admin belum dikonfigurasi di server.' },
                { status: 500 }
            )
        };
    }

    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return {
            error: NextResponse.json(
                { error: 'Sesi login tidak valid.' },
                { status: 401 }
            )
        };
    }

    const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .maybeSingle();

    if (profileError || !profile || profile.role !== 'admin' || profile.is_active === false) {
        return {
            error: NextResponse.json(
                { error: 'Akses admin dibutuhkan untuk menghapus data.' },
                { status: 403 }
            )
        };
    }

    return {
        adminClient,
        user
    };
}

export async function POST(request) {
    const context = await requireAdminContext();

    if ('error' in context) {
        return context.error;
    }

    const { adminClient, user } = context;
    const body = await request.json().catch(() => null);
    const entity = body?.entity;
    const id = body?.id;

    if (!entity || !id) {
        return NextResponse.json(
            { error: 'Entity dan id wajib dikirim.' },
            { status: 400 }
        );
    }

    if (entity === 'product') {
        const { error } = await adminClient
            .from('products')
            .delete()
            .eq('id', Number(id));

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    }

    if (entity === 'report') {
        const { error } = await adminClient
            .from('feedback_reports')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    }

    if (entity === 'profile') {
        if (String(id) === String(user.id)) {
            return NextResponse.json(
                { error: 'Akun admin yang sedang dipakai tidak bisa dihapus.' },
                { status: 400 }
            );
        }

        const { error } = await adminClient.auth.admin.deleteUser(String(id));

        if (error) {
            const fallback = await adminClient
                .from('profiles')
                .delete()
                .eq('id', String(id));

            if (fallback.error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
        }

        return NextResponse.json({ success: true });
    }

    return NextResponse.json(
        { error: 'Jenis data tidak dikenali.' },
        { status: 400 }
    );
}
