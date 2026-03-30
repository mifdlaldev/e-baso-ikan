'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, MapPin, Clock } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white pt-20 pb-10 px-8 border-t border-gray-100 text-sm">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">E</div>
                        <span className="font-bold text-2xl text-gray-900 tracking-tight">E-Baso</span>
                    </div>
                    <p className="text-gray-500 leading-relaxed mb-8 text-base">Platform pemesanan online resmi untuk Kantin Sekolah. Cepat, segar, dan nyaman.</p>
                    <div className="flex gap-4">
                        <Facebook size={24} className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
                        <Twitter size={24} className="text-gray-400 hover:text-blue-400 transition-colors cursor-pointer" />
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-8 text-lg">Tautan Cepat</h4>
                    <ul className="space-y-4 text-gray-500 font-medium">
                        <li><Link href="/home" className="hover:text-blue-600 transition-colors">Menu</Link></li>
                        <li><Link href="/orders" className="hover:text-blue-600 transition-colors">Pesanan Saya</Link></li>
                        <li><Link href="/profile" className="hover:text-blue-600 transition-colors">Profil</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-8 text-lg">Bantuan</h4>
                    <ul className="space-y-4 text-gray-500 font-medium">
                        <li><Link href="/help?type=pusat-bantuan" className="hover:text-blue-600 transition-colors">Pusat Bantuan</Link></li>
                        <li><Link href="/help?type=lapor-masalah" className="hover:text-blue-600 transition-colors">Laporkan Masalah</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-8 text-lg">Hubungi Kami</h4>
                    <ul className="space-y-4 text-gray-500 font-medium">
                        <li className="flex items-start gap-3">
                            <MapPin size={20} className="text-blue-600 shrink-0 mt-0.5" />
                            <span>Kantin SMKN 1 Sumedang, Kampus Belakang</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Clock size={20} className="text-blue-600 shrink-0 mt-0.5" />
                            <span>Senin - Jumat: 07:00 - Sampai Habis</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 font-medium">
                <p>&copy; {new Date().getFullYear()} E-Baso Kantin. Hak cipta dilindungi.</p>
            </div>
        </footer>
    );
}
