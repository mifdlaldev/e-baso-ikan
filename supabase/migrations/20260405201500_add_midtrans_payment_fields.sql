alter table public.orders
add column if not exists payment_provider text,
add column if not exists payment_status text,
add column if not exists payment_reference text,
add column if not exists payment_payload jsonb,
add column if not exists paid_at timestamptz;
