import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getProductImagesBucket } from '@/lib/supabase/storage';

function slugify(value = '') {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

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
                { error: 'Akses admin dibutuhkan untuk upload gambar produk.' },
                { status: 403 }
            )
        };
    }

    return { adminClient };
}

async function ensureBucket(adminClient, bucket) {
    const { data: buckets, error: listError } = await adminClient.storage.listBuckets();

    if (listError) {
        return { error: listError };
    }

    const exists = buckets?.some((item) => item.name === bucket || item.id === bucket);

    if (exists) {
        return { error: null };
    }

    const { error: createError } = await adminClient.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    return { error: createError };
}

export async function POST(request) {
    const context = await requireAdminContext();

    if ('error' in context) {
        return context.error;
    }

    const { adminClient } = context;
    const formData = await request.formData().catch(() => null);
    const file = formData?.get('file');
    const slug = slugify(String(formData?.get('slug') || 'produk-baru'));

    if (!(file instanceof File)) {
        return NextResponse.json(
            { error: 'File gambar wajib dipilih.' },
            { status: 400 }
        );
    }

    if (!file.type.startsWith('image/')) {
        return NextResponse.json(
            { error: 'File harus berupa gambar.' },
            { status: 400 }
        );
    }

    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
            { error: 'Ukuran gambar maksimal 5 MB.' },
            { status: 400 }
        );
    }

    const bucket = getProductImagesBucket();
    const { error: bucketError } = await ensureBucket(adminClient, bucket);

    if (bucketError) {
        return NextResponse.json(
            { error: `Gagal menyiapkan bucket storage: ${bucketError.message}` },
            { status: 400 }
        );
    }

    const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : 'jpg';
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension || 'jpg'}`;
    const filePath = `products/${slug || 'produk-baru'}/${fileName}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await adminClient
        .storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: true
        });

    if (uploadError) {
        return NextResponse.json(
            { error: `Upload gambar gagal: ${uploadError.message}` },
            { status: 400 }
        );
    }

    const { data: publicUrlData } = adminClient
        .storage
        .from(bucket)
        .getPublicUrl(filePath);

    return NextResponse.json({
        success: true,
        bucket,
        path: filePath,
        publicUrl: publicUrlData.publicUrl
    });
}
