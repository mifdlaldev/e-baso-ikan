'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PackageCheck, Soup, TimerReset } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency, formatOrderDate, resolvePaymentMethodLabel } from '../../lib/formatters';
import { useHydrated } from '../../hooks/useHydrated';
import SiteFooter from '../../components/SiteFooter';
import SiteHeader from '../../components/SiteHeader';
import { useAuth } from '../../context/AuthContext';
import { getSupabaseBrowserClient } from '../../lib/supabase/client';
import { mapDbOrderToApp } from '../../lib/supabase/mappers';

function getStatusStyle(status) {
    switch (status) {
        case 'Selesai':
            return 'bg-[#eef5f2] text-[#1f5c57]';
        case 'Diproses':
            return 'bg-[#eef1fb] text-[#2d3b73]';
        default:
            return 'bg-[#fff1e8] text-[#d66b43]';
    }
}

export default function OrdersPage() {
    const { orders: localOrders } = useCart();
    const { isAuthenticated, loading, user } = useAuth();
    const isHydrated = useHydrated();
    const [remoteOrders, setRemoteOrders] = useState([]);
    const [isFetchingRemoteOrders, setIsFetchingRemoteOrders] = useState(false);

    useEffect(() => {
        const loadOrders = async () => {
            if (!isAuthenticated || !user?.id) {
                setRemoteOrders([]);
                return;
            }

            const supabase = getSupabaseBrowserClient();
            if (!supabase) return;

            setIsFetchingRemoteOrders(true);

            const primaryResult = await supabase
                .from('orders')
                .select(`
                    id,
                    order_code,
                    customer_name,
                    customer_note,
                    payment_method,
                    payment_provider,
                    payment_status,
                    payment_reference,
                    paid_at,
                    fulfillment_method,
                    fulfillment_location,
                    status,
                    total_amount,
                    created_at,
                    order_items (
                        id,
                        product_id,
                        product_name,
                        product_slug,
                        unit_price,
                        quantity,
                        addons
                    )
                `)
                .eq('profile_id', user.id)
                .order('created_at', { ascending: false });

            let data = primaryResult.data;
            let error = primaryResult.error;

            if (error && /column .* does not exist/i.test(error.message || '')) {
                const fallbackResult = await supabase
                    .from('orders')
                    .select(`
                        id,
                        order_code,
                        customer_name,
                        customer_note,
                        payment_method,
                        fulfillment_method,
                        fulfillment_location,
                        status,
                        total_amount,
                        created_at,
                        order_items (
                            id,
                            product_id,
                            product_name,
                            product_slug,
                            unit_price,
                            quantity,
                            addons
                        )
                    `)
                    .eq('profile_id', user.id)
                    .order('created_at', { ascending: false });

                data = fallbackResult.data;
                error = fallbackResult.error;
            }

            if (error) {
                console.warn('Failed to load Supabase orders:', error.message);
                setIsFetchingRemoteOrders(false);
                return;
            }

            setRemoteOrders((data || []).map((order) => mapDbOrderToApp(order)));
            setIsFetchingRemoteOrders(false);
        };

        void loadOrders();
    }, [isAuthenticated, user?.id]);

    const orders = isAuthenticated ? remoteOrders : localOrders;

    if (!isHydrated || loading) {
        return (
            <div className="pb-8 pt-4">
                <SiteHeader />

                <main className="shell mt-6 space-y-6">
                    <section className="section-card rounded-[40px] px-6 py-8 sm:px-10">
                        <div className="flex flex-col gap-4 border-b border-[rgba(31,35,51,0.08)] pb-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Pesanan Saya</p>
                                <h1 className="font-display text-4xl text-[#1f2333] sm:text-5xl">Menyiapkan daftar pesananmu.</h1>
                            </div>
                            <p className="max-w-xl text-sm leading-7 text-[#5b6170]">
                                Sistem sedang menyinkronkan akun dan data pesanan agar isi halaman ini cocok dengan status pembelianmu yang terbaru.
                            </p>
                        </div>
                    </section>

                    <section className="section-card rounded-[40px] p-10 text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6b6f7b]">Memuat pesanan customer...</p>
                    </section>
                </main>

                <SiteFooter />
            </div>
        );
    }

    return (
        <div className="pb-8 pt-4">
            <SiteHeader />

            <main className="shell mt-6 space-y-6">
                <section className="section-card rounded-[40px] px-6 py-8 sm:px-10">
                    <div className="flex flex-col gap-4 border-b border-[rgba(31,35,51,0.08)] pb-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Pesanan Saya</p>
                            <h1 className="font-display text-4xl text-[#1f2333] sm:text-5xl">Lihat semua pesanan yang sudah kamu beli.</h1>
                        </div>
                        <div className="max-w-xl space-y-2 text-sm leading-7 text-[#5b6170]">
                            <p>
                                Semua pembelian customer dirangkum di halaman ini, mulai dari order terbaru, metode bayar, sampai detail item yang sudah pernah dibeli.
                            </p>
                            {!isAuthenticated && (
                                <p className="rounded-[20px] bg-[#fffaf2] px-4 py-3 text-[#1f2333]">
                                    Login dulu agar halaman ini bisa menampilkan semua pesanan yang tersimpan di akunmu.
                                </p>
                            )}
                            {isAuthenticated && (
                                <p className="rounded-[20px] bg-[#eef5f2] px-4 py-3 text-[#1f5c57]">
                                    Akun aktif. Halaman ini sedang membaca semua pesanan customer langsung dari Supabase.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {isAuthenticated && isFetchingRemoteOrders ? (
                    <section className="section-card rounded-[40px] p-10 text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6b6f7b]">Mengambil data pesanan dari Supabase...</p>
                    </section>
                ) : orders.length === 0 ? (
                    <section className="section-card rounded-[40px] p-10 text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#f3ebdf] text-[#1f5c57]">
                            <Soup size={42} />
                        </div>
                        <h2 className="font-display mt-6 text-4xl text-[#1f2333]">Belum ada pesanan tercatat.</h2>
                        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#5b6170]">
                            Begitu checkout selesai, status pesanan akan muncul di sini lengkap dengan daftar menu dan total pembayarannya.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <Link href="/#menu" className="inline-flex rounded-full bg-[#1f2333] px-6 py-3 text-sm font-semibold text-white">
                                Pesan Menu Sekarang
                            </Link>
                            {!isAuthenticated && (
                                <Link href="/auth?next=/pesanan-saya" className="inline-flex rounded-full border border-[rgba(31,35,51,0.08)] bg-white px-6 py-3 text-sm font-semibold text-[#1f2333]">
                                    Login Dulu
                                </Link>
                            )}
                        </div>
                    </section>
                ) : (
                    <section className="space-y-4">
                        {orders.map((order, index) => (
                            <article key={order.id} className="section-card overflow-hidden rounded-[34px]">
                                <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                                    <div className="border-b border-[rgba(31,35,51,0.08)] p-6 sm:p-8 lg:border-b-0 lg:border-r">
                                        <div className="mb-6 flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Order #{index + 1}</p>
                                                <h2 className="font-display mt-2 text-4xl text-[#1f2333]">{order.id}</h2>
                                            </div>
                                            <span className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="space-y-4 text-sm text-[#5b6170]">
                                            <div className="flex items-center gap-3 rounded-[24px] bg-[#fffaf2] p-4">
                                                <TimerReset size={18} className="text-[#d66b43]" />
                                                <span>{formatOrderDate(order.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 rounded-[24px] bg-[#fffaf2] p-4">
                                                <PackageCheck size={18} className="text-[#1f5c57]" />
                                                <span>{order.deliveryMethod === 'delivery' ? order.classRoom : 'Ambil di kantin'}</span>
                                            </div>
                                            <div className="rounded-[24px] bg-[#fffaf2] p-4">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">Pembayaran</p>
                                                <p className="mt-2 font-semibold text-[#1f2333]">
                                                    {resolvePaymentMethodLabel(order)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        <div className="space-y-3">
                                            {order.items.map((item, itemIndex) => (
                                                <div key={`${order.id}-${itemIndex}`} className="flex items-center gap-4 rounded-[24px] bg-[#fffaf2] p-4">
                                                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            sizes="64px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-[#1f2333]">{item.name}</p>
                                                        <p className="text-xs uppercase tracking-[0.22em] text-[#6b6f7b]">{item.quantity} porsi</p>
                                                        {Array.isArray(item.extras) && item.extras.length > 0 && (
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {item.extras.map((extra) => (
                                                                    <span key={extra} className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b6f7b]">
                                                                        {extra}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="font-semibold text-[#1f2333]">Rp {formatCurrency(item.price * item.quantity)}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-5 flex items-center justify-between border-t border-[rgba(31,35,51,0.08)] pt-5">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">Total order</p>
                                                <p className="font-display text-4xl text-[#d66b43]">Rp {formatCurrency(order.total)}</p>
                                            </div>
                                            <Link href="/#menu" className="rounded-full border border-[rgba(31,35,51,0.08)] bg-white px-4 py-3 text-sm font-semibold text-[#1f2333] hover:bg-[#f4ebdf]">
                                                Pesan Lagi
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>

            <SiteFooter />
        </div>
    );
}
