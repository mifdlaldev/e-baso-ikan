'use client';

import Image from 'next/image';
import Script from 'next/script';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, CreditCard, MapPin, ReceiptText } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../lib/formatters';
import { getMidtransEnv, getMidtransSnapScriptUrl, hasMidtransClientEnv } from '../../lib/midtrans/env';
import { useHydrated } from '../../hooks/useHydrated';
import SiteFooter from '../../components/SiteFooter';
import SiteHeader from '../../components/SiteHeader';

const paymentOptions = [
    { key: 'tunai', title: 'Tunai Saat Ambil', note: 'Bayar di kasir ketika pesanan ready.' },
    { key: 'midtrans', title: 'Via Midtrans', note: 'QRIS, e-wallet, VA, dan kartu dalam satu popup.' }
];

const deliveryOptions = [
    { key: 'pickup', title: 'Ambil di Kantin', note: 'Pilihan tercepat untuk menu yang baru matang.' },
    { key: 'delivery', title: 'Antar ke Kelas', note: 'Isi lokasi kelas atau ruangan dengan jelas.' }
];

export default function CheckoutPage() {
    const { cartItems, checkout, clearCart } = useCart();
    const { user, profile, isAuthenticated, loading } = useAuth();
    const isHydrated = useHydrated();
    const [customerName, setCustomerName] = useState('');
    const [orderNote, setOrderNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('tunai');
    const [deliveryMethod, setDeliveryMethod] = useState('pickup');
    const [destination, setDestination] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [successCopy, setSuccessCopy] = useState({
        title: 'Pesananmu masuk ke dapur.',
        description: 'Tim e-baso-ikan sedang menyiapkan pesananmu. Kamu bisa lanjut ke halaman pesanan untuk melihat status terbaru.'
    });
    const [checkoutError, setCheckoutError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingMidtransPayment, setPendingMidtransPayment] = useState(null);

    const subtotal = useMemo(
        () => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
        [cartItems]
    );
    const serviceFee = cartItems.length > 0 ? 2000 : 0;
    const total = subtotal + serviceFee;
    const midtransEnabled = hasMidtransClientEnv();
    const { clientKey: midtransClientKey } = getMidtransEnv();

    useEffect(() => {
        if (profile?.full_name && !customerName.trim()) {
            setCustomerName(profile.full_name);
        }
    }, [customerName, profile?.full_name]);

    if (!isHydrated) {
        return (
            <div className="pb-8 pt-4">
                <SiteHeader />
                <main className="shell mt-6">
                    <section className="section-card rounded-[40px] p-10 text-center">
                        <h1 className="font-display text-5xl text-[#1f2333]">Menyiapkan checkout...</h1>
                        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#5b6170]">
                            Ringkasan pesanan sedang disinkronkan dari perangkatmu supaya total dan metode pembayaran tampil akurat.
                        </p>
                    </section>
                </main>
                <SiteFooter />
            </div>
        );
    }

    const syncMidtransOrder = async (orderId) => {
        if (!orderId) return null;

        const response = await fetch('/api/payments/midtrans/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderId })
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result?.error || 'Gagal sinkronisasi status Midtrans ke server.');
        }

        return result;
    };

    const launchMidtransPopup = (snapToken, orderId) => {
        if (typeof window === 'undefined' || !window.snap) {
            throw new Error('Popup Midtrans belum siap dimuat. Coba tunggu sebentar lalu klik lagi.');
        }

        const successRedirectUrl = `/checkout/success?order_id=${encodeURIComponent(orderId)}`;

        window.snap.pay(snapToken, {
            onSuccess: async () => {
                try {
                    const syncResult = await syncMidtransOrder(orderId);
                    const transactionStatus = syncResult?.transaction?.status || 'settlement';
                    clearCart();
                    setPendingMidtransPayment(null);
                    window.location.href = `${successRedirectUrl}&transaction_status=${encodeURIComponent(transactionStatus)}`;
                    return;
                } catch (error) {
                    console.warn('Failed to sync paid Midtrans order:', error);
                }

                clearCart();
                setPendingMidtransPayment(null);
                setSuccessCopy({
                    title: 'Pembayaran Midtrans berhasil.',
                    description: 'Pembayaranmu sudah tercatat dan pesanan langsung masuk ke sistem e-baso-ikan. Kamu bisa cek statusnya di halaman pesanan.'
                });
                setCheckoutError('');
                setIsSuccess(true);
            },
            onPending: async () => {
                try {
                    const syncResult = await syncMidtransOrder(orderId);
                    const transactionStatus = syncResult?.transaction?.status || 'pending';
                    clearCart();
                    setPendingMidtransPayment(null);
                    window.location.href = `${successRedirectUrl}&transaction_status=${encodeURIComponent(transactionStatus)}`;
                    return;
                } catch (error) {
                    console.warn('Failed to sync pending Midtrans order:', error);
                }

                clearCart();
                setPendingMidtransPayment(null);
                setSuccessCopy({
                    title: 'Pembayaran Midtrans menunggu diselesaikan.',
                    description: 'Instruksi pembayaran sudah muncul dari Midtrans. Pesananmu sudah tercatat dan bisa dilanjutkan sesuai metode yang kamu pilih.'
                });
                setCheckoutError('');
                setIsSuccess(true);
            },
            onError: (result) => {
                console.warn('Midtrans popup error:', result);
                setCheckoutError('Midtrans gagal memproses pembayaran. Coba buka lagi popup-nya atau pilih metode lain.');
            },
            onClose: () => {
                setCheckoutError('Popup Midtrans ditutup sebelum pembayaran selesai. Klik tombol lagi untuk melanjutkan pembayaran yang sama.');
            }
        });
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        if (!customerName.trim()) {
            alert('Masukkan nama pemesan dulu sebelum checkout.');
            return;
        }

        if (deliveryMethod === 'delivery' && !destination.trim()) {
            alert('Isi lokasi kelas atau ruangan untuk pengantaran.');
            return;
        }

        setIsSubmitting(true);
        setCheckoutError('');

        try {
            const checkoutPayload = {
                note: orderNote,
                paymentMethod,
                deliveryMethod,
                classRoom: deliveryMethod === 'delivery' ? destination : 'Ambil di kantin',
                nama_pembeli: customerName
            };

            if (paymentMethod !== 'midtrans') {
                await checkout(checkoutPayload);
                setSuccessCopy({
                    title: 'Pesananmu masuk ke dapur.',
                    description: 'Tim e-baso-ikan sedang menyiapkan pesananmu. Kamu bisa lanjut ke halaman pesanan untuk melihat status terbaru.'
                });
                setIsSuccess(true);
                return;
            }

            if (!midtransEnabled) {
                throw new Error('Midtrans belum dikonfigurasi di environment. Isi client key dan server key terlebih dulu.');
            }

            if (pendingMidtransPayment?.token) {
                launchMidtransPopup(pendingMidtransPayment.token, pendingMidtransPayment.orderId);
                return;
            }

            const orderResult = await checkout(checkoutPayload, { clearCart: false });

            if (!orderResult?.orderId) {
                throw new Error('Pesanan belum berhasil dibuat, jadi token Midtrans belum bisa dibuka.');
            }

            if (!orderResult.supabaseOrderId) {
                throw new Error('Order Midtrans belum tersimpan ke Supabase. Jalankan migration Midtrans terbaru lalu coba lagi.');
            }

            const response = await fetch('/api/payments/midtrans/snap-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderId: orderResult.orderId,
                    total: orderResult.total,
                    serviceFee,
                    items: cartItems,
                    customerName,
                    customerEmail: user?.email || '',
                    customerPhone: profile?.phone || '',
                    deliveryMethod,
                    destination: deliveryMethod === 'delivery' ? destination : 'Ambil di kantin',
                    orderNote
                })
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result?.token) {
                throw new Error(result?.error || 'Gagal membuat token pembayaran Midtrans.');
            }

            setPendingMidtransPayment({
                token: result.token,
                orderId: orderResult.orderId
            });
            launchMidtransPopup(result.token, orderResult.orderId);
        } catch (error) {
            setCheckoutError(error.message || 'Checkout gagal diproses.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0 && !isSuccess) {
        return (
            <div className="pb-8 pt-4">
                <SiteHeader />
                <main className="shell mt-6">
                    <section className="section-card rounded-[40px] p-10 text-center">
                        <h1 className="font-display text-5xl text-[#1f2333]">Checkout belum bisa dimulai.</h1>
                        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#5b6170]">
                            Keranjangmu masih kosong, jadi belum ada yang bisa dibayar. Kembali ke menu dulu, lalu pilih baso ikan favoritmu.
                        </p>
                        <Link href="/#menu" className="mt-8 inline-flex rounded-full bg-[#1f2333] px-6 py-3 text-sm font-semibold text-white">
                            Pilih Menu
                        </Link>
                    </section>
                </main>
                <SiteFooter />
            </div>
        );
    }

    if (!loading && !isAuthenticated) {
        return (
            <div className="pb-8 pt-4">
                <SiteHeader />

                <main className="shell mt-6 space-y-6">
                    <section className="section-card rounded-[40px] px-6 py-8 sm:px-10">
                        <div className="flex flex-col gap-4 border-b border-[rgba(31,35,51,0.08)] pb-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Checkout</p>
                                <h1 className="font-display text-4xl text-[#1f2333] sm:text-5xl">Login dulu sebelum lanjut pembayaran.</h1>
                            </div>
                            <p className="max-w-xl text-sm leading-7 text-[#5b6170]">
                                Untuk menjaga data pesanan, riwayat, dan pembayaran Midtrans tetap terhubung ke akun yang benar, checkout sekarang hanya bisa dilanjutkan setelah masuk atau daftar akun.
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                        <div className="section-card rounded-[34px] p-6 sm:p-8">
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Akses dibutuhkan</p>
                            <h2 className="font-display mt-3 text-4xl text-[#1f2333]">Masuk atau buat akun dulu.</h2>
                            <p className="mt-4 text-sm leading-7 text-[#5b6170]">
                                Setelah login, kamu akan dikembalikan lagi ke checkout supaya bisa langsung pilih metode bayar dan menyelesaikan order.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link href="/auth?next=/checkout" className="inline-flex rounded-full bg-[#1f2333] px-6 py-3 text-sm font-semibold text-white">
                                    Masuk / Daftar Dulu
                                </Link>
                                <Link href="/cart" className="inline-flex rounded-full border border-[rgba(31,35,51,0.08)] bg-white px-6 py-3 text-sm font-semibold text-[#1f2333]">
                                    Kembali ke Keranjang
                                </Link>
                            </div>
                        </div>

                        <aside className="section-card rounded-[34px] p-6 sm:p-8">
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Ringkasan belanja</p>
                            <h2 className="font-display mt-2 text-4xl text-[#1f2333]">Pesananmu siap dibayar.</h2>

                            <div className="mt-8 space-y-4">
                                {cartItems.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="flex items-center gap-4 rounded-[24px] bg-[#fffaf2] p-4">
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
                                        </div>
                                        <p className="font-semibold text-[#1f2333]">Rp {formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 space-y-4 border-t border-[rgba(31,35,51,0.08)] pt-6 text-sm">
                                <div className="flex items-center justify-between text-[#5b6170]">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-[#1f2333]">Rp {formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex items-center justify-between text-[#5b6170]">
                                    <span>Biaya layanan</span>
                                    <span className="font-semibold text-[#1f2333]">Rp {formatCurrency(serviceFee)}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-[rgba(31,35,51,0.08)] pt-4">
                                    <span className="font-semibold text-[#1f2333]">Total bayar</span>
                                    <span className="font-display text-4xl text-[#d66b43]">Rp {formatCurrency(total)}</span>
                                </div>
                            </div>
                        </aside>
                    </section>
                </main>

                <SiteFooter />
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="pb-8 pt-4">
                {midtransEnabled && midtransClientKey ? (
                    <Script
                        id="midtrans-snap"
                        src={getMidtransSnapScriptUrl()}
                        data-client-key={midtransClientKey}
                        strategy="afterInteractive"
                    />
                ) : null}
                <SiteHeader />
                <main className="shell mt-6">
                    <section className="section-card rounded-[40px] p-10 text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#eef5f2] text-[#1f5c57]">
                            <CheckCircle2 size={44} />
                        </div>
                        <h1 className="font-display mt-6 text-5xl text-[#1f2333]">{successCopy.title}</h1>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#5b6170]">
                            {successCopy.description}
                        </p>
                        <Link href="/pesanan-saya" className="mt-8 inline-flex rounded-full bg-[#d66b43] px-6 py-3 text-sm font-semibold text-white">
                            Lihat Pesanan Saya
                        </Link>
                    </section>
                </main>
                <SiteFooter />
            </div>
        );
    }

    return (
        <div className="pb-8 pt-4">
            {midtransEnabled && midtransClientKey ? (
                <Script
                    id="midtrans-snap"
                    src={getMidtransSnapScriptUrl()}
                    data-client-key={midtransClientKey}
                    strategy="afterInteractive"
                />
            ) : null}
            <SiteHeader />

            <main className="shell mt-6 space-y-6">
                <section className="section-card rounded-[40px] px-6 py-8 sm:px-10">
                    <div className="flex flex-col gap-4 border-b border-[rgba(31,35,51,0.08)] pb-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Checkout</p>
                            <h1 className="font-display text-4xl text-[#1f2333] sm:text-5xl">Tahap akhir sebelum pesanan diproses.</h1>
                        </div>
                        <p className="max-w-xl text-sm leading-7 text-[#5b6170]">
                            Isi data pemesan, tentukan metode ambil, dan pilih pembayaran. Semua tetap dibuat singkat agar alur pesan makanan terasa cepat.
                        </p>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                    <div className="space-y-6">
                        <div className="section-card rounded-[34px] p-6 sm:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3ebdf] text-[#d66b43]">
                                    <ReceiptText size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Identitas pesanan</p>
                                    <h2 className="font-display text-3xl text-[#1f2333]">Siapa yang memesan?</h2>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <input
                                    value={customerName}
                                    onChange={(event) => setCustomerName(event.target.value)}
                                    placeholder="Nama lengkap pemesan"
                                    className="w-full rounded-[24px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-5 py-4 text-sm text-[#1f2333] outline-none placeholder:text-[#8a8f9b] focus:border-[#1f5c57]"
                                />
                                <textarea
                                    value={orderNote}
                                    onChange={(event) => setOrderNote(event.target.value)}
                                    rows={4}
                                    placeholder="Catatan pesanan, misalnya saus dipisah atau tanpa tambahan tertentu."
                                    className="w-full rounded-[24px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-5 py-4 text-sm text-[#1f2333] outline-none placeholder:text-[#8a8f9b] focus:border-[#1f5c57]"
                                />
                            </div>
                        </div>

                        <div className="section-card rounded-[34px] p-6 sm:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3ebdf] text-[#1f5c57]">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Pengambilan</p>
                                    <h2 className="font-display text-3xl text-[#1f2333]">Pilih cara menerima.</h2>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {deliveryOptions.map((option) => (
                                    <button
                                        key={option.key}
                                        onClick={() => setDeliveryMethod(option.key)}
                                        className={`rounded-[24px] border px-5 py-5 text-left ${deliveryMethod === option.key ? 'border-[#1f5c57] bg-[#eef5f2]' : 'border-[rgba(31,35,51,0.08)] bg-[#fffaf2]'}`}
                                    >
                                        <p className="font-display text-2xl text-[#1f2333]">{option.title}</p>
                                        <p className="mt-2 text-sm leading-7 text-[#5b6170]">{option.note}</p>
                                    </button>
                                ))}
                            </div>

                            {deliveryMethod === 'delivery' && (
                                <textarea
                                    value={destination}
                                    onChange={(event) => setDestination(event.target.value)}
                                    rows={3}
                                    placeholder="Contoh: XII RPL 1, Lab Komputer 2, atau Ruang Guru."
                                    className="mt-4 w-full rounded-[24px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-5 py-4 text-sm text-[#1f2333] outline-none placeholder:text-[#8a8f9b] focus:border-[#1f5c57]"
                                />
                            )}
                        </div>

                        <div className="section-card rounded-[34px] p-6 sm:p-8">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3ebdf] text-[#2d3b73]">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Pembayaran</p>
                                    <h2 className="font-display text-3xl text-[#1f2333]">Pilih metode bayar.</h2>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {paymentOptions.map((option) => (
                                    <button
                                        key={option.key}
                                        onClick={() => setPaymentMethod(option.key)}
                                        className={`rounded-[24px] border px-4 py-5 text-left ${paymentMethod === option.key ? 'border-[#2d3b73] bg-[#eef1fb]' : 'border-[rgba(31,35,51,0.08)] bg-[#fffaf2]'}`}
                                    >
                                        <p className="font-display text-2xl text-[#1f2333]">{option.title}</p>
                                        <p className="mt-2 text-sm leading-7 text-[#5b6170]">{option.note}</p>
                                    </button>
                                ))}
                            </div>

                            {paymentMethod === 'midtrans' ? (
                                <div className="mt-4 rounded-[24px] border border-[rgba(45,59,115,0.12)] bg-[#eef1fb] px-5 py-4 text-sm leading-7 text-[#45507a]">
                                    Midtrans akan membuka popup Snap untuk QRIS, GoPay, ShopeePay, virtual account, dan kartu. Cocok untuk presentasi karena alurnya lebih realistis.
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <aside className="section-card rounded-[34px] p-6 sm:p-8 xl:sticky xl:top-32 xl:h-fit">
                        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Ringkasan belanja</p>
                        <h2 className="font-display mt-2 text-4xl text-[#1f2333]">Yang akan kamu bayar.</h2>

                        <div className="mt-8 space-y-4">
                            {cartItems.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="flex items-center gap-4 rounded-[24px] bg-[#fffaf2] p-4">
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
                                    </div>
                                    <p className="font-semibold text-[#1f2333]">Rp {formatCurrency(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 space-y-4 border-t border-[rgba(31,35,51,0.08)] pt-6 text-sm">
                            <div className="flex items-center justify-between text-[#5b6170]">
                                <span>Subtotal</span>
                                <span className="font-semibold text-[#1f2333]">Rp {formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between text-[#5b6170]">
                                <span>Biaya layanan</span>
                                <span className="font-semibold text-[#1f2333]">Rp {formatCurrency(serviceFee)}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-[rgba(31,35,51,0.08)] pt-4">
                                <span className="font-semibold text-[#1f2333]">Total bayar</span>
                                <span className="font-display text-4xl text-[#d66b43]">Rp {formatCurrency(total)}</span>
                            </div>
                        </div>

                        {checkoutError ? (
                            <div className="mt-6 rounded-[22px] border border-[rgba(214,107,67,0.18)] bg-[#fff1eb] px-4 py-3 text-sm leading-7 text-[#a04c2f]">
                                {checkoutError}
                            </div>
                        ) : null}

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="mt-8 w-full rounded-full bg-[#1f2333] px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(31,35,51,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting
                                ? 'Memproses Checkout...'
                                : paymentMethod === 'midtrans'
                                    ? (pendingMidtransPayment?.token ? 'Lanjutkan Pembayaran Midtrans' : 'Bayar dengan Midtrans')
                                    : 'Konfirmasi Pesanan'}
                        </button>
                    </aside>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
