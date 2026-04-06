'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FishSymbol, LogOut, ShieldCheck, ShoppingBag, ShoppingCart, UserRound } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useHydrated } from '../hooks/useHydrated';

const navigation = [
    { href: '/', label: 'Beranda' },
    { href: '/#menu', label: 'Menu' },
    { href: '/pesanan-saya', label: 'Pesanan Saya' }
];

export default function SiteHeader() {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const { isAdmin, isAuthenticated, loading, profile, signOut } = useAuth();
    const isHydrated = useHydrated();

    const accountLabel = profile?.full_name || 'Akun';
    const extendedNavigation = isAdmin
        ? [...navigation, { href: '/admin', label: 'Admin' }]
        : navigation;

    const handleSignOut = async () => {
        const { error } = await signOut();

        if (error) {
            alert('Gagal logout. Coba ulang sebentar lagi.');
        }
    };

    return (
        <header className="sticky top-4 z-50 shell">
            <div className="glass-panel grain-overlay rounded-[28px] px-5 py-4 sm:px-7">
                <div className="flex items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f5c57] text-white shadow-[0_14px_28px_rgba(31,92,87,0.25)]">
                            <FishSymbol size={22} />
                        </div>
                        <div>
                            <p className="font-display text-xl font-semibold tracking-tight text-[#1f2333] sm:text-2xl">
                                e-baso-ikan
                            </p>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6b6f7b]">
                                seafood snack house
                            </p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-2 rounded-full border border-[rgba(31,35,51,0.08)] bg-white/70 px-2 py-2 md:flex">
                        {extendedNavigation.map((item) => {
                            const isActive = item.href === '/'
                                ? pathname === '/'
                                : pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold ${isActive
                                        ? 'bg-[#1f2333] text-white'
                                        : 'text-[#4e5361] hover:bg-[#f3ebdf] hover:text-[#1f2333]'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-3">
                        {loading ? (
                            <div className="hidden h-11 w-28 rounded-full bg-white/60 sm:block" />
                        ) : isAuthenticated ? (
                            <>
                                <Link
                                    href={isAdmin ? '/admin' : '/auth'}
                                    className="hidden items-center gap-2 rounded-full border border-[rgba(31,35,51,0.08)] bg-white/70 px-4 py-2 text-sm font-semibold text-[#1f2333] hover:bg-[#f3ebdf] lg:inline-flex"
                                >
                                    {isAdmin ? <ShieldCheck size={16} /> : <UserRound size={16} />}
                                    {accountLabel}
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="hidden items-center gap-2 rounded-full border border-[rgba(31,35,51,0.08)] bg-white/70 px-4 py-2 text-sm font-semibold text-[#1f2333] hover:bg-[#f3ebdf] sm:inline-flex"
                                >
                                    <LogOut size={16} />
                                    Keluar
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth"
                                className="hidden rounded-full border border-[rgba(31,35,51,0.08)] bg-white/70 px-4 py-2 text-sm font-semibold text-[#1f2333] hover:bg-[#f3ebdf] sm:inline-flex"
                            >
                                Masuk
                            </Link>
                        )}
                        <Link
                            href="/cart"
                            className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d66b43] text-white shadow-[0_14px_28px_rgba(214,107,67,0.22)] hover:-translate-y-0.5"
                            aria-label="Keranjang"
                        >
                            <ShoppingCart size={20} />
                            <span
                                suppressHydrationWarning
                                className={`absolute -right-2 -top-2 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#fff8ef] bg-[#1f2333] px-1 text-[11px] font-bold transition ${isHydrated && cartCount > 0 ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                            >
                                {isHydrated && cartCount > 0 ? cartCount : ''}
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
