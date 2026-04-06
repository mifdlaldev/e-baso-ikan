import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import ClearCartOnSuccess from './ClearCartOnSuccess';
import SiteFooter from '../../../components/SiteFooter';
import SiteHeader from '../../../components/SiteHeader';

function resolveStatusCopy(status) {
    switch (String(status || '').toLowerCase()) {
        case 'settlement':
        case 'capture':
            return {
                title: 'Pembayaran berhasil diproses.',
                description: 'Midtrans sudah mengembalikan kamu ke e-baso-ikan. Pesananmu sudah tercatat dan tim dapur bisa langsung menindaklanjuti.'
            };
        case 'pending':
            return {
                title: 'Pembayaran sedang menunggu penyelesaian.',
                description: 'Instruksi pembayaran sudah dibuat. Selesaikan pembayarannya sesuai metode yang dipilih, lalu cek status order dari halaman pesanan.'
            };
        case 'deny':
        case 'cancel':
        case 'expire':
        case 'failure':
            return {
                title: 'Pembayaran belum berhasil.',
                description: 'Transaksi belum selesai diproses. Kamu masih bisa kembali ke checkout atau melihat status pesanan untuk memastikan kondisi terbarunya.'
            };
        default:
            return {
                title: 'Kamu kembali ke halaman sukses checkout.',
                description: 'Halaman ini dipakai sebagai finish redirect Midtrans supaya pelanggan tetap kembali ke website e-baso-ikan, bukan ke domain contoh.'
            };
    }
}

export default async function CheckoutSuccessPage({ searchParams }) {
    const params = await searchParams;
    const orderId = params?.order_id || '';
    const transactionStatus = params?.transaction_status || '';
    const statusCode = params?.status_code || '';
    const copy = resolveStatusCopy(transactionStatus);

    return (
        <div className="pb-8 pt-4">
            <ClearCartOnSuccess enabled={Boolean(orderId)} />
            <SiteHeader />

            <main className="shell mt-6 space-y-6">
                <section className="section-card rounded-[40px] p-10 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#eef5f2] text-[#1f5c57]">
                        <CheckCircle2 size={44} />
                    </div>
                    <p className="mt-8 text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Checkout Success</p>
                    <h1 className="font-display mt-3 text-5xl text-[#1f2333]">{copy.title}</h1>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#5b6170]">
                        {copy.description}
                    </p>

                    <div className="mx-auto mt-8 grid max-w-2xl gap-4 rounded-[28px] bg-[#fffaf2] p-6 text-left sm:grid-cols-2">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">Order ID</p>
                            <p className="mt-2 text-lg font-semibold text-[#1f2333]">{orderId || 'Belum tersedia'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">Status Midtrans</p>
                            <p className="mt-2 text-lg font-semibold text-[#1f2333]">
                                {transactionStatus || 'Kembali dari popup'}
                                {statusCode ? ` • ${statusCode}` : ''}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Link href="/pesanan-saya" className="inline-flex rounded-full bg-[#1f2333] px-6 py-3 text-sm font-semibold text-white">
                            Lihat Pesanan Saya
                        </Link>
                        <Link href="/" className="inline-flex rounded-full border border-[rgba(31,35,51,0.08)] bg-white px-6 py-3 text-sm font-semibold text-[#1f2333]">
                            Kembali ke Beranda
                        </Link>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
