'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import SiteFooter from '../../components/SiteFooter';
import SiteHeader from '../../components/SiteHeader';
import { useAuth } from '../../context/AuthContext';

const benefits = [
    {
        title: 'Pesanan tersimpan',
        text: 'Order yang dibuat saat login bisa langsung muncul di halaman pesanan dari perangkat yang sama.'
    },
    {
        title: 'Siap untuk admin',
        text: 'Akun yang diberi role admin di Supabase akan langsung bisa membuka dashboard admin.'
    },
    {
        title: 'Praktis untuk demo',
        text: 'Cukup satu akun untuk menunjukkan alur pelanggan, lalu ganti role untuk presentasi sisi admin.'
    }
];

function AuthPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, loading, profile, signIn, signUp } = useAuth();
    const [mode, setMode] = useState('signin');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const isSignUp = mode === 'signup';
    const requestedNextPath = searchParams.get('next');
    const nextPath = requestedNextPath && requestedNextPath.startsWith('/')
        ? requestedNextPath
        : '/pesanan-saya';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        setErrorMessage('');

        const response = isSignUp
            ? await signUp({ email, password, fullName })
            : await signIn({ email, password });

        setIsSubmitting(false);

        if (response.error) {
            setErrorMessage(response.error.message);
            return;
        }

        if (isSignUp) {
            setMessage('Akun berhasil dibuat dan langsung aktif. Kamu akan masuk otomatis tanpa konfirmasi email.');
        }

        router.push(nextPath);
    };

    return (
        <div className="pb-8 pt-4">
            <SiteHeader />

            <main className="shell mt-6 space-y-6">
                <section className="section-card rounded-[40px] px-6 py-8 sm:px-10">
                    <div className="flex flex-col gap-4 border-b border-[rgba(31,35,51,0.08)] pb-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Akun</p>
                            <h1 className="font-display text-4xl text-[#1f2333] sm:text-5xl">Masuk cepat untuk sinkron pesanan dan akses admin.</h1>
                        </div>
                        <p className="max-w-xl text-sm leading-7 text-[#5b6170]">
                            Halaman ini saya buat ringkas supaya kamu bisa langsung demo alur pelanggan dan admin tanpa pindah sistem.
                        </p>
                    </div>
                </section>

                {loading ? (
                    <section className="section-card rounded-[40px] p-10 text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6b6f7b]">Mengecek sesi akun...</p>
                    </section>
                ) : isAuthenticated ? (
                    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="section-card rounded-[36px] p-8">
                            <div className="mb-5 inline-flex rounded-3xl bg-[#1f5c57] p-4 text-white">
                                <ShieldCheck size={24} />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Akun aktif</p>
                            <h2 className="font-display mt-3 text-4xl text-[#1f2333]">{profile?.full_name || 'Pengguna e-baso-ikan'}</h2>
                            <p className="mt-4 text-sm leading-7 text-[#5b6170]">
                                Kamu sudah login. Sekarang kamu bisa lanjut cek pesanan, checkout terhubung ke profil, dan jika role-mu `admin`, dashboard admin juga aktif.
                            </p>
                            {nextPath === '/checkout' ? (
                                <div className="mt-4 rounded-[24px] bg-[#eef5f2] px-5 py-4 text-sm text-[#1f5c57]">
                                    Checkout menunggu akun aktif. Lanjutkan ke halaman pembayaran setelah login.
                                </div>
                            ) : null}
                        </div>

                        <div className="section-card rounded-[36px] p-8">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Link href={nextPath} className="rounded-[26px] bg-[#1f2333] px-5 py-5 text-white">
                                    <p className="font-display text-3xl">{nextPath === '/checkout' ? 'Lanjut Checkout' : 'Lihat Pesanan'}</p>
                                    <p className="mt-2 text-sm text-white/75">
                                        {nextPath === '/checkout' ? 'Kembali ke pembayaran dan lanjutkan order-mu.' : 'Pantau order yang sudah masuk ke Supabase.'}
                                    </p>
                                </Link>
                                <Link href="/admin" className="rounded-[26px] bg-[#d66b43] px-5 py-5 text-white">
                                    <p className="font-display text-3xl">Dashboard Admin</p>
                                    <p className="mt-2 text-sm text-white/75">Buka jika akunmu sudah diberi role admin.</p>
                                </Link>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                        <div className="space-y-6">
                            <div className="section-card rounded-[36px] p-8">
                                <div className="mb-5 inline-flex rounded-3xl bg-[#1f2333] p-4 text-white">
                                    <UserRound size={24} />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Akses pengguna</p>
                                <h2 className="font-display mt-3 text-4xl text-[#1f2333]">Satu akun untuk alur pembeli, satu role untuk alur admin.</h2>
                                <p className="mt-4 text-sm leading-7 text-[#5b6170]">
                                    Buat akun pelanggan biasa dulu. Setelah itu, kamu bisa ubah role di tabel `profiles` menjadi `admin` untuk demo dashboard admin.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                                {benefits.map((item) => (
                                    <article key={item.title} className="section-card rounded-[30px] p-6">
                                        <p className="font-display text-2xl text-[#1f2333]">{item.title}</p>
                                        <p className="mt-3 text-sm leading-7 text-[#5b6170]">{item.text}</p>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <section className="section-card rounded-[36px] p-6 sm:p-8">
                            <div className="inline-flex rounded-full bg-[#f3ebdf] p-1">
                                <button
                                    onClick={() => setMode('signin')}
                                    className={`rounded-full px-5 py-2 text-sm font-semibold ${!isSignUp ? 'bg-[#1f2333] text-white' : 'text-[#1f2333]'}`}
                                >
                                    Masuk
                                </button>
                                <button
                                    onClick={() => setMode('signup')}
                                    className={`rounded-full px-5 py-2 text-sm font-semibold ${isSignUp ? 'bg-[#1f2333] text-white' : 'text-[#1f2333]'}`}
                                >
                                    Daftar
                                </button>
                            </div>

                            <div className="mt-6">
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">
                                    {isSignUp ? 'Buat akun baru' : 'Masuk ke akun'}
                                </p>
                                <h2 className="font-display mt-3 text-4xl text-[#1f2333]">
                                    {isSignUp ? 'Siapkan akun presentasi.' : 'Lanjut pakai akun yang sudah ada.'}
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                                {isSignUp && (
                                    <input
                                        value={fullName}
                                        onChange={(event) => setFullName(event.target.value)}
                                        placeholder="Nama lengkap"
                                        className="w-full rounded-[24px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-5 py-4 text-sm text-[#1f2333] outline-none placeholder:text-[#8a8f9b] focus:border-[#1f5c57]"
                                    />
                                )}
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="Email"
                                    className="w-full rounded-[24px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-5 py-4 text-sm text-[#1f2333] outline-none placeholder:text-[#8a8f9b] focus:border-[#1f5c57]"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Password"
                                    className="w-full rounded-[24px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-5 py-4 text-sm text-[#1f2333] outline-none placeholder:text-[#8a8f9b] focus:border-[#1f5c57]"
                                />

                                {errorMessage && (
                                    <div className="rounded-[24px] bg-[#fff3ee] px-5 py-4 text-sm text-[#b3471f]">
                                        {errorMessage}
                                    </div>
                                )}

                                {message && (
                                    <div className="rounded-[24px] bg-[#eef5f2] px-5 py-4 text-sm text-[#1f5c57]">
                                        {message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1f2333] px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(31,35,51,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <KeyRound size={16} />
                                    {isSubmitting ? 'Memproses...' : isSignUp ? 'Buat Akun' : 'Masuk Sekarang'}
                                </button>
                            </form>
                        </section>
                    </section>
                )}
            </main>

            <SiteFooter />
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={(
            <div className="pb-8 pt-4">
                <SiteHeader />
                <main className="shell mt-6">
                    <section className="section-card rounded-[40px] p-10 text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6b6f7b]">Menyiapkan akses akun...</p>
                    </section>
                </main>
                <SiteFooter />
            </div>
        )}
        >
            <AuthPageContent />
        </Suspense>
    );
}
