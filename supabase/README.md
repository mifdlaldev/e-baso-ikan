# Supabase Setup

Project ini sudah disiapkan untuk memakai Supabase sebagai sumber data produk, pesanan, feedback, dan profil user.

## Environment

Isi file `.env` dengan nilai dari project Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://lschofrtccbbcizcxzas.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Struktur Data

Migration utama ada di:

- `supabase/migrations/20260405090000_init_e_baso_ikan.sql`

Schema ini mencakup:

- `profiles`: profil aplikasi yang terhubung ke `auth.users`
- `products`: katalog menu publik
- `product_addons`: tambahan per produk
- `orders`: header pesanan
- `order_items`: item detail per pesanan
- `feedback_reports`: saran atau laporan dari pengguna

Role admin diatur lewat kolom `profiles.role`.

## Seed Data

Data awal menu ada di:

- `supabase/seed.sql`

Seed akan mengisi:

- Baso Ikan Original
- Baso Ikan Jumbo
- Baso Ikan Mie
- Es Teh Manis

beserta addon masing-masing.

## Menjalankan Migration

Jika memakai Supabase CLI:

```bash
supabase db push
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

Atau jalankan isi file migration dan seed lewat SQL Editor di dashboard Supabase.
