'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../lib/formatters';
import SiteFooter from '../../components/SiteFooter';
import SiteHeader from '../../components/SiteHeader';
import { useHydrated } from '../../hooks/useHydrated';

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart();
    const { isAuthenticated } = useAuth();
    const hydrated = useHydrated();

    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const serviceFee = cartItems.length > 0 ? 2000 : 0;
    const total = subtotal + serviceFee;

    return (
        <div className="pb-8 pt-4">
            <SiteHeader />

            <main className="shell mt-6 space-y-6">
                <section className="section-card rounded-[40px] px-6 py-8 sm:px-10">
                    <div className="flex flex-col gap-4 border-b border-[rgba(31,35,51,0.08)] pb-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Keranjang</p>
                            <h1 className="font-display text-4xl text-[#1f2333] sm:text-5xl">Pesananmu sebelum masuk kasir.</h1>
                        </div>
                        <p className="max-w-xl text-sm leading-7 text-[#5b6170]">
                            Semua item di sini sudah siap dilanjutkan ke checkout. Kamu masih bisa atur jumlah, hapus item, atau balik ke menu.
                        </p>
                    </div>
                </section>

                {!hydrated ? (
                    <section className="section-card rounded-[40px] p-10 text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#f3ebdf] text-[#1f5c57]">
                            <ShoppingBag size={40} />
                        </div>
                        <h2 className="font-display mt-6 text-4xl text-[#1f2333]">Keranjang sedang disiapkan.</h2>
                        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#5b6170]">
                            Kami sedang menyinkronkan item terbaru dari perangkatmu supaya isi keranjang tampil dengan akurat.
                        </p>
                    </section>
                ) : cartItems.length === 0 ? (
                    <section className="section-card rounded-[40px] p-10 text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#f3ebdf] text-[#1f5c57]">
                            <ShoppingBag size={40} />
                        </div>
                        <h2 className="font-display mt-6 text-4xl text-[#1f2333]">Keranjangmu masih kosong.</h2>
                        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#5b6170]">
                            Mulai dari baso ikan original, jumbo, mie, atau es teh. Begitu ditambahkan, semuanya akan langsung muncul di sini.
                        </p>
                        <Link
                            href="/#menu"
                            className="mt-8 inline-flex rounded-full bg-[#1f2333] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(31,35,51,0.18)] hover:-translate-y-0.5"
                        >
                            Kembali ke Menu
                        </Link>
                    </section>
                ) : (
                    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <div className="space-y-4">
                            {cartItems.map((item, index) => (
                                <article key={`${item.id}-${index}`} className="section-card rounded-[34px] p-5 sm:p-6">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                        <div className="relative h-28 w-full overflow-hidden rounded-[28px] sm:w-36">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="(max-width: 640px) 100vw, 144px"
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">{item.category || 'Menu'}</p>
                                                    <h2 className="font-display mt-2 text-3xl text-[#1f2333]">{item.name}</h2>
                                                    {Array.isArray(item.extras) && item.extras.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {item.extras.map((extra) => (
                                                                <span key={extra} className="rounded-full bg-[#f3ebdf] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b6f7b]">
                                                                    {extra}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(index)}
                                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3ee] text-[#d66b43] hover:bg-[#ffe5da]"
                                                    aria-label={`Hapus ${item.name}`}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">Harga satuan</p>
                                                    <p className="font-display text-3xl text-[#1f2333]">Rp {formatCurrency(item.price)}</p>
                                                </div>

                                                <div className="flex items-center gap-3 rounded-full bg-[#fffaf2] p-2">
                                                    <button
                                                        onClick={() => updateQuantity(index, -1)}
                                                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1f2333]"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="min-w-8 text-center text-base font-bold text-[#1f2333]">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(index, 1)}
                                                        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f5c57] text-white"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <aside className="section-card rounded-[34px] p-6 sm:p-8 xl:sticky xl:top-32 xl:h-fit">
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Ringkasan</p>
                            <h2 className="font-display mt-2 text-4xl text-[#1f2333]">Siap masuk checkout.</h2>

                            <div className="mt-8 space-y-5 text-sm">
                                <div className="flex items-center justify-between text-[#5b6170]">
                                    <span>Total item</span>
                                    <span className="font-semibold text-[#1f2333]">{cartCount} porsi</span>
                                </div>
                                <div className="flex items-center justify-between text-[#5b6170]">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-[#1f2333]">Rp {formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between text-[#5b6170]">
                                    <span>Biaya layanan</span>
                                    <span className="font-semibold text-[#1f2333]">Rp {formatCurrency(serviceFee)}</span>
                                </div>
                                <div className="border-t border-[rgba(31,35,51,0.08)] pt-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-[#5b6170]">Total akhir</span>
                                        <span className="font-display text-4xl text-[#d66b43]">Rp {formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-3">
                                <Link
                                    href={isAuthenticated ? '/checkout' : '/auth?next=/checkout'}
                                    className="block rounded-full bg-[#1f2333] px-5 py-4 text-center text-sm font-semibold text-white shadow-[0_16px_30px_rgba(31,35,51,0.18)] hover:-translate-y-0.5"
                                >
                                    {isAuthenticated ? 'Lanjut ke Checkout' : 'Masuk untuk Checkout'}
                                </Link>
                                <Link
                                    href="/#menu"
                                    className="block rounded-full border border-[rgba(31,35,51,0.08)] bg-white px-5 py-4 text-center text-sm font-semibold text-[#1f2333] hover:bg-[#f4ebdf]"
                                >
                                    Tambah Menu Lagi
                                </Link>
                            </div>
                        </aside>
                    </section>
                )}
            </main>

            <SiteFooter />
        </div>
    );
}
