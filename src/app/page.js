'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flame, Sparkles, TimerReset } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/formatters';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import FeedbackSection from '../components/FeedbackSection';
import { useHydrated } from '../hooks/useHydrated';

export default function LandingPage() {
  const { menus, addToCart } = useCart();
  const hydrated = useHydrated();
  const featuredProducts = hydrated ? menus.slice(0, 4) : [];
  const visibleMenus = hydrated ? menus : [];

  return (
    <div className="pb-8 pt-4">
      <SiteHeader />

      <main className="shell mt-6 space-y-8">
        <section className="section-card grain-overlay overflow-hidden rounded-[44px] border border-[rgba(31,35,51,0.08)] px-6 py-8 sm:px-10 lg:px-14 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.95fr] lg:items-center">
            <div className="stagger-rise">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(31,35,51,0.08)] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#1f5c57]">
                <Sparkles size={14} />
                signature seafood canteen
              </div>
              <h1 className="font-display max-w-4xl text-[3.1rem] leading-[0.96] tracking-tight text-[#1f2333] sm:text-[4.6rem] lg:text-[6rem]">
                Baso ikan hangat,
                <span className="block text-[#d66b43]">visual baru yang lebih menggugah.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#555b68] sm:text-lg">
                e-baso-ikan kini dibuat lebih fokus sebagai rumah digital untuk menu baso ikan.
                Tampilan baru ini terasa seperti menu board premium: hangat, gurih, cepat dipilih, dan mudah dipesan.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#menu"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1f2333] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(31,35,51,0.18)] hover:-translate-y-0.5"
                >
                  Lihat Menu
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/pesanan-saya"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,35,51,0.08)] bg-white/70 px-6 py-3 text-sm font-semibold text-[#1f2333] hover:bg-[#f4ebdf]"
                >
                  Pesanan Saya
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[28px] bg-[#fffaf2] p-5 shadow-[0_18px_36px_rgba(39,32,20,0.08)]">
                  <p className="font-display text-3xl text-[#1f2333]">4</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-[#6b6f7b]">menu fokus</p>
                </div>
                <div className="rounded-[28px] bg-[#fffaf2] p-5 shadow-[0_18px_36px_rgba(39,32,20,0.08)]">
                  <p className="font-display text-3xl text-[#1f2333]">7 mnt</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-[#6b6f7b]">rata-rata siap</p>
                </div>
                <div className="rounded-[28px] bg-[#fffaf2] p-5 shadow-[0_18px_36px_rgba(39,32,20,0.08)]">
                  <p className="font-display text-3xl text-[#1f2333]">fresh</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-[#6b6f7b]">diracik cepat</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {hydrated ? featuredProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/menu/${product.slug}`}
                  className={`floating-card section-card overflow-hidden rounded-[32px] border border-[rgba(31,35,51,0.08)] ${index === 0 ? 'sm:translate-y-6' : ''}`}
                  style={{ animationDelay: `${index * 0.4}s` }}
                >
                  <div className="aspect-[4/4.6] overflow-hidden">
                    <div className="relative h-full w-full">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 40vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-3 inline-flex rounded-full bg-[#f3ebdf] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">
                      {product.category}
                    </div>
                    <h2 className="font-display text-2xl text-[#1f2333]">{product.shortName}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#5b6170]">{product.servingNote}</p>
                  </div>
                </Link>
              )) : Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`featured-skeleton-${index}`}
                  className={`section-card overflow-hidden rounded-[32px] border border-[rgba(31,35,51,0.08)] ${index === 0 ? 'sm:translate-y-6' : ''}`}
                >
                  <div className="aspect-[4/4.6] bg-[#efe6da]" />
                  <div className="space-y-3 p-5">
                    <div className="h-6 w-20 rounded-full bg-[#f3ebdf]" />
                    <div className="h-8 w-32 rounded-full bg-[#efe6da]" />
                    <div className="h-4 w-full rounded-full bg-[#f8f0e5]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="section-card rounded-[36px] p-8">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Kenapa redesign ini terasa lebih cocok</p>
            <h2 className="font-display text-4xl leading-tight text-[#1f2333]">
              Dari website kantin umum menjadi identitas yang benar-benar milik baso ikan.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#555b68]">
              Aksen warna laut, tekstur hangat seperti kertas menu, dan foto makanan yang jadi pusat visual membuat brand ini lebih spesifik, lebih mudah diingat, dan lebih relevan dengan nama e-baso-ikan.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Flame, title: 'Gurih panas', text: 'Semua copy dan tampilan diarahkan ke sensasi makanan yang baru matang.' },
              { icon: TimerReset, title: 'Cepat pilih', text: 'Jalur pesan dipangkas agar fokus dari lihat menu ke checkout terasa singkat.' },
              { icon: Sparkles, title: 'Lebih khas', text: 'Typography dan warna kini terasa seperti brand makanan, bukan dashboard sekolah.' }
            ].map((item, index) => (
              <div key={item.title} className="section-card stagger-rise rounded-[32px] p-6" style={{ animationDelay: `${index * 120}ms` }}>
                <div className="mb-5 inline-flex rounded-2xl bg-[#f3ebdf] p-3 text-[#d66b43]">
                  <item.icon size={20} />
                </div>
                <h3 className="font-display text-2xl text-[#1f2333]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5b6170]">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="menu" className="section-card rounded-[40px] px-6 py-8 sm:px-10 sm:py-10">
          <div className="mb-8 flex flex-col gap-4 border-b border-[rgba(31,35,51,0.08)] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Menu hari ini</p>
              <h2 className="font-display text-4xl text-[#1f2333] sm:text-5xl">Baso ikan sebagai pemeran utama.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5b6170]">
              Semua produk didesain mengitari rasa inti yang sama: gurih laut, tekstur hangat, dan penyajian cepat.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {hydrated ? visibleMenus.map((product, index) => (
              <article
                key={product.id}
                className="section-card stagger-rise overflow-hidden rounded-[30px] border border-[rgba(31,35,51,0.08)]"
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <Link href={`/menu/${product.slug}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition duration-700 hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 inline-flex rounded-full bg-[#fff8ef] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#1f2333]">
                      {product.category}
                    </div>
                  </div>
                </Link>

                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="font-display text-3xl leading-none text-[#1f2333]">{product.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#5b6170]">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[rgba(31,35,51,0.08)] pt-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">Mulai dari</p>
                      <p className="font-display text-3xl text-[#1f2333]">Rp {formatCurrency(product.price)}</p>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="rounded-full bg-[#1f5c57] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(31,92,87,0.2)] hover:-translate-y-0.5"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              </article>
            )) : Array.from({ length: 4 }).map((_, index) => (
              <article
                key={`menu-skeleton-${index}`}
                className="section-card overflow-hidden rounded-[30px] border border-[rgba(31,35,51,0.08)]"
              >
                <div className="aspect-[4/3] bg-[#efe6da]" />
                <div className="space-y-4 p-5">
                  <div className="h-8 w-2/3 rounded-full bg-[#efe6da]" />
                  <div className="h-4 w-full rounded-full bg-[#f8f0e5]" />
                  <div className="flex items-center justify-between border-t border-[rgba(31,35,51,0.08)] pt-4">
                    <div className="h-10 w-24 rounded-full bg-[#efe6da]" />
                    <div className="h-11 w-24 rounded-full bg-[#d9ebe8]" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <FeedbackSection />
      </main>

      <SiteFooter />
    </div>
  );
}
