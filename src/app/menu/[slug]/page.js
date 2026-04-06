'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Flame, Leaf, Plus, Minus, Timer } from 'lucide-react';
import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import { useCart } from '../../../context/CartContext';
import { formatCurrency } from '../../../lib/formatters';
import { getProductBySlug } from '../../../lib/productCatalog';

export default function MenuDetailPage() {
    const params = useParams();
    const { products } = useCart();

    const product = useMemo(() => (
        products.find((item) => item.slug === params.slug) || getProductBySlug(params.slug)
    ), [params.slug, products]);

    return <MenuDetailContent key={product.slug} product={product} />;
}

function MenuDetailContent({ product }) {
    const router = useRouter();
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [customerName, setCustomerName] = useState('');
    const [note, setNote] = useState('');
    const [extras, setExtras] = useState({});

    const addOns = product.addons || [];
    const addonsTotal = addOns.reduce((total, addOn) => (
        extras[addOn.key] ? total + (addOn.price * quantity) : total
    ), 0);
    const total = (product.price * quantity) + addonsTotal;

    const handleToggleExtra = (key) => {
        setExtras((current) => ({ ...current, [key]: !current[key] }));
    };

    const handleAddToCart = () => {
        if (!customerName.trim()) {
            alert('Isi nama pemesan dulu supaya order-nya lebih rapi.');
            return;
        }

        const selectedExtras = addOns
            .filter((addOn) => extras[addOn.key])
            .map((addOn) => addOn.label);

        addToCart({
            ...product,
            price: product.price + addOns.reduce((totalPrice, addOn) => (
                extras[addOn.key] ? totalPrice + addOn.price : totalPrice
            ), 0),
            note,
            nama_pembeli: customerName
        }, quantity, selectedExtras);

        router.push('/cart');
    };

    return (
        <div className="pb-8 pt-4">
            <SiteHeader />

            <main className="shell mt-6 space-y-6">
                <Link
                    href="/#menu"
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,35,51,0.08)] bg-white/70 px-5 py-3 text-sm font-semibold text-[#1f2333] hover:bg-[#f3ebdf]"
                >
                    <ArrowLeft size={16} />
                    Kembali ke Menu
                </Link>

                <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="section-card overflow-hidden rounded-[40px]">
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="(max-width: 1024px) 100vw, 55vw"
                                className="object-cover"
                            />
                            <div className="absolute left-6 top-6 inline-flex rounded-full bg-[#fff8ef] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.26em] text-[#1f2333]">
                                {product.category}
                            </div>
                        </div>

                        <div className="space-y-6 p-6 sm:p-8">
                            <div className="flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Menu detail</p>
                                    <h1 className="font-display mt-2 text-5xl leading-none text-[#1f2333]">{product.name}</h1>
                                </div>
                                <p className="font-display text-4xl text-[#d66b43]">Rp {formatCurrency(product.price)}</p>
                            </div>

                            <p className="max-w-2xl text-base leading-8 text-[#555b68]">
                                {product.longDescription || product.description}
                            </p>

                            <div className="grid gap-4 sm:grid-cols-3">
                                {[
                                    { icon: Flame, label: 'Kalori', value: product.calories },
                                    { icon: Timer, label: 'Waktu siap', value: product.prepTime },
                                    { icon: Leaf, label: 'Karakter', value: product.freshness }
                                ].map((item) => (
                                    <div key={item.label} className="rounded-[28px] bg-[#fffaf2] p-5">
                                        <div className="mb-4 inline-flex rounded-2xl bg-[#f3ebdf] p-3 text-[#d66b43]">
                                            <item.icon size={18} />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#6b6f7b]">{item.label}</p>
                                        <p className="mt-2 text-sm font-semibold text-[#1f2333]">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside className="section-card rounded-[40px] p-6 sm:p-8 lg:sticky lg:top-32 lg:h-fit">
                        <div className="mb-8 border-b border-[rgba(31,35,51,0.08)] pb-6">
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Pesan sekarang</p>
                            <h2 className="font-display mt-2 text-4xl text-[#1f2333]">Racik pesananmu.</h2>
                            <p className="mt-3 text-sm leading-7 text-[#5b6170]">
                                Semua detail tetap memakai layout yang sama, tapi isi dan tambahan menyesuaikan tiap produk.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="mb-3 block text-xs font-bold uppercase tracking-[0.26em] text-[#6b6f7b]">
                                    Jumlah
                                </label>
                                <div className="flex items-center justify-between rounded-[26px] bg-[#fffaf2] p-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#1f2333]"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="w-10 text-center text-lg font-bold text-[#1f2333]">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity((current) => current + 1)}
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f5c57] text-white"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <div className="pr-3 text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">Subtotal</p>
                                        <p className="font-display text-3xl text-[#1f2333]">Rp {formatCurrency(product.price * quantity)}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-3 block text-xs font-bold uppercase tracking-[0.26em] text-[#6b6f7b]">
                                    Tambahan populer
                                </label>
                                <div className="space-y-3">
                                    {addOns.map((addOn) => (
                                        <label
                                            key={addOn.key}
                                            className={`flex cursor-pointer items-center justify-between rounded-[24px] border px-4 py-4 ${extras[addOn.key] ? 'border-[#1f5c57] bg-[#eef5f2]' : 'border-[rgba(31,35,51,0.08)] bg-[#fffaf2]'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(extras[addOn.key])}
                                                    onChange={() => handleToggleExtra(addOn.key)}
                                                    className="h-5 w-5 rounded border-[#d8d0c4] accent-[#1f5c57]"
                                                />
                                                <span className="text-sm font-semibold text-[#1f2333]">{addOn.label}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-[#d66b43]">
                                                {addOn.price > 0 ? `+ Rp ${formatCurrency(addOn.price)}` : 'Gratis'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-3 block text-xs font-bold uppercase tracking-[0.26em] text-[#6b6f7b]">
                                    Nama pemesan
                                </label>
                                <input
                                    value={customerName}
                                    onChange={(event) => setCustomerName(event.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    className="w-full rounded-[24px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-5 py-4 text-sm text-[#1f2333] outline-none placeholder:text-[#8a8f9b] focus:border-[#1f5c57]"
                                />
                            </div>

                            <div>
                                <label className="mb-3 block text-xs font-bold uppercase tracking-[0.26em] text-[#6b6f7b]">
                                    Catatan tambahan
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(event) => setNote(event.target.value)}
                                    rows={4}
                                    placeholder="Contoh: saus dipisah, jangan terlalu pedas, es teh tanpa lemon."
                                    className="w-full rounded-[24px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-5 py-4 text-sm text-[#1f2333] outline-none placeholder:text-[#8a8f9b] focus:border-[#1f5c57]"
                                />
                            </div>

                            <div className="rounded-[28px] bg-[#1f2333] p-5 text-white">
                                <div className="flex items-center justify-between text-sm text-white/70">
                                    <span>Total sementara</span>
                                    <span>{quantity} porsi</span>
                                </div>
                                <p className="font-display mt-2 text-4xl">Rp {formatCurrency(total)}</p>
                                <button
                                    onClick={handleAddToCart}
                                    className="mt-5 w-full rounded-full bg-[#d66b43] px-5 py-4 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(214,107,67,0.2)] hover:-translate-y-0.5"
                                >
                                    Tambah ke Keranjang
                                </button>
                            </div>
                        </div>
                    </aside>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
