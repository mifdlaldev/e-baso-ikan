import Link from 'next/link';
import { Clock3, FishSymbol, MapPin } from 'lucide-react';

export default function SiteFooter() {
    return (
        <footer className="shell pb-10 pt-16">
            <div className="section-card wave-divider rounded-[36px] px-6 py-10 sm:px-10">
                <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr_0.9fr]">
                    <div className="max-w-xl">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f5c57] text-white">
                                <FishSymbol size={20} />
                            </div>
                            <div>
                                <p className="font-display text-2xl font-semibold text-[#1f2333]">e-baso-ikan</p>
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6b6f7b]">freshly fried seafood bites</p>
                            </div>
                        </div>
                        <p className="text-sm leading-7 text-[#555b68] sm:text-base">
                            Dirancang ulang untuk menghadirkan pengalaman pesan makanan yang lebih fokus, lebih hangat,
                            dan lebih menggugah selera. Semua berputar di sekitar baso ikan sebagai menu utama.
                        </p>
                    </div>

                    <div>
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#6b6f7b]">Jelajahi</p>
                        <div className="space-y-3 text-sm font-semibold text-[#1f2333]">
                            <Link href="/" className="block hover:text-[#1f5c57]">Beranda</Link>
                            <Link href="/#menu" className="block hover:text-[#1f5c57]">Menu Hari Ini</Link>
                            <Link href="/cart" className="block hover:text-[#1f5c57]">Keranjang</Link>
                            <Link href="/pesanan-saya" className="block hover:text-[#1f5c57]">Pesanan Saya</Link>
                        </div>
                    </div>

                    <div className="space-y-4 text-sm text-[#555b68]">
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="mt-1 text-[#d66b43]" />
                            <span>Kantin sekolah, area belakang, siap ambil setiap hari aktif.</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock3 size={18} className="mt-1 text-[#d66b43]" />
                            <span>Senin - Jumat, 07.00 sampai stok baso ikan habis.</span>
                        </div>
                    </div>
                </div>

                <div className="mt-10 border-t border-[rgba(31,35,51,0.08)] pt-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#6b6f7b]">
                    © {new Date().getFullYear()} e-baso-ikan
                </div>
            </div>
        </footer>
    );
}
