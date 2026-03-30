'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Send, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

function HelpContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'pusat-bantuan';
    const isPusatBantuan = type === 'pusat-bantuan';

    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [openFaq, setOpenFaq] = useState(null);
    const { addReport } = useCart();
    const router = useRouter();

    const faqs = [
        {
            q: "Bagaimana cara memesan?",
            a: "Klik menu 'Daftar Menu', pilih item yang Anda inginkan, masukkan ke keranjang, dan lakukan Checkout."
        },
        {
            q: "Di mana lokasi Kantin Belakang?",
            a: "Kantin kami berada di area Kampus Belakang SMKN 1 Sumedang."
        },
        {
            q: "Jam berapa kantin buka?",
            a: "Kantin buka setiap hari Senin sampai Jumat mulai jam 07:00 pagi hingga stok menu habis."
        }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((!isPusatBantuan && !category) || !description.trim()) {
            alert('Silakan lengkapi formulir terlebih dahulu.');
            return;
        }

        addReport({
            type: isPusatBantuan ? 'BANTUAN' : 'LAPORAN',
            category: isPusatBantuan ? 'Umum' : category,
            message: description
        });

        alert('Pesan Anda telah terkirim! Tim kami akan segera menindaklanjuti.');
        router.push('/home');
    };

    const bgHeader = 'bg-blue-600';
    const bgButton = 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30';

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Navbar Simple */}
            <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${bgHeader} rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20 transition-colors`}>E</div>
                        <span className="font-bold text-xl text-gray-800 tracking-tight">
                            {isPusatBantuan ? 'Pusat Bantuan' : 'Laporkan Masalah'}
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-4 py-16">
                {/* FAQ Section for Pusat Bantuan */}
                {isPusatBantuan && (
                    <div className="mb-12 space-y-4">
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <HelpCircle size={24} className="text-blue-600" />
                            Pertanyaan Sering Diajukan (FAQ)
                        </h2>
                        <div className="space-y-3">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm transition-all">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-bold text-sm text-gray-700">{faq.q}</span>
                                        {openFaq === idx ? <ChevronUp size={18} className="text-blue-600" /> : <ChevronDown size={18} className="text-gray-400" />}
                                    </button>
                                    {openFaq === idx && (
                                        <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                                            <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden transform transition-all">
                    <div className={`${bgHeader} p-10 text-center text-white transition-colors`}>
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
                            {isPusatBantuan ? <HelpCircle size={32} /> : <AlertCircle size={32} />}
                        </div>
                        <h1 className="text-3xl font-black mb-3">
                            {isPusatBantuan ? 'Ada yang bisa kami bantu?' : 'Ada masalah apa hari ini?'}
                        </h1>
                        <p className="text-white/80 opacity-90">
                            {isPusatBantuan
                                ? 'Tanyakan apapun kepada tim kami mengenai layanan kantin.'
                                : 'Laporkan kendala Anda agar kami bisa memberikan solusi terbaik.'}
                        </p>
                    </div>

                    <div className="p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {!isPusatBantuan && (
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-gray-700 uppercase tracking-widest ml-1">Kategori Masalah</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1.5rem_center] bg-no-repeat"
                                    >
                                        <option value="" disabled>Pilih kategori...</option>
                                        <option value="Masalah Pembayaran">Masalah Pembayaran</option>
                                        <option value="Aplikasi Error">Aplikasi Error</option>
                                        <option value="Lainnya">Masalah Lainnya</option>
                                    </select>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-widest ml-1">
                                    {isPusatBantuan ? 'DESKRIPSI BANTUAN' : 'DESKRIPSI MASALAH'}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={isPusatBantuan ? "Tuliskan pertanyaan atau bantuan yang Anda butuhkan..." : "Ceritakan detail masalah yang Anda alami..."}
                                    rows={5}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className={`w-full ${bgButton} text-white font-black py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 group active:scale-95`}
                            >
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                {isPusatBantuan ? 'Kirim Pertanyaan' : 'Kirim Laporan'}
                            </button>

                            <p className="text-center text-gray-400 text-xs font-medium">
                                {isPusatBantuan
                                    ? 'Tim kami akan membantu menjawab pertanyaanmu secepat mungkin.'
                                    : 'Laporan Anda membantu kami meningkatkan layanan kantin.'}
                            </p>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function HelpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400">Loading...</div>}>
            <HelpContent />
        </Suspense>
    );
}
