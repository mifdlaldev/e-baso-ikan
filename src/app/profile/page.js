'use client';

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, LogOut, User, Mail, MapPin, Bell, Shield, ChevronRight, Camera, LayoutGrid, History, ShoppingCart } from 'lucide-react';
import Footer from '../../components/Footer';

export default function ProfilePage() {
    const { cartCount } = useCart();
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">E</div>
                    <span className="font-bold text-xl text-gray-800 tracking-tight">E-Baso</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/home" className="font-medium text-gray-500 hover:text-blue-600 transition-colors">Menu</Link>
                    <Link href="/orders" className="font-medium text-gray-500 hover:text-blue-600 transition-colors">Pesanan Saya</Link>
                    <Link href="/history" className="font-medium text-gray-500 hover:text-blue-600 transition-colors">Riwayat</Link>
                    <Link href="/profile" className="font-medium text-blue-600">Profil</Link>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/cart" className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <ShoppingCart size={22} />
                        {cartCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">{cartCount}</span>
                        )}
                    </Link>

                    {/* User Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            className="flex items-center gap-3 p-1.5 pr-3 bg-blue-50/50 hover:bg-blue-50 rounded-full transition-all border border-blue-100/50"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center overflow-hidden border border-white shadow-sm font-bold text-white text-xs">U</div>
                            <span className="text-sm font-bold text-blue-800 hidden sm:block">User</span>
                        </button>

                        {isUserDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-[60] transform origin-top-right transition-all">
                                <Link href="/home" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                    <LayoutGrid size={16} /> Menu
                                </Link>
                                <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 font-bold bg-blue-50/50">
                                    <User size={16} /> Profil
                                </Link>
                                <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                    <ShoppingBag size={16} /> Pesanan Saya
                                </Link>
                                <Link href="/history" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                    <History size={16} /> Riwayat
                                </Link>
                                <div className="h-px bg-gray-50 my-1"></div>
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors">
                                    <LogOut size={16} /> Keluar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                    {/* Sidebar / Profile Card */}
                    <div className="w-full md:w-80 flex-shrink-0">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/20 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                            <div className="relative mt-8 mb-6">
                                <div className="w-24 h-24 rounded-full bg-white p-1 mx-auto shadow-lg">
                                    <div className="w-full h-full rounded-full bg-blue-50 flex items-center justify-center text-blue-600 relative group overflow-hidden">
                                        <User size={40} />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                            <Camera size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-xl font-black text-gray-900 mb-1">Nama Pengguna</h2>
                            <p className="text-gray-400 text-sm font-medium mb-6">Siswa Kelas XII IPA 1</p>

                            <div className="flex justify-center gap-4 border-t border-gray-50 pt-6">
                                <div>
                                    <p className="text-lg font-black text-gray-900">12</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Pesanan</p>
                                </div>
                                <div className="w-px h-8 bg-gray-50 mt-1"></div>
                                <div>
                                    <p className="text-lg font-black text-gray-900">3</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Favorit</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Settings / Info */}
                    <div className="flex-1 w-full space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 mb-6">Informasi Personal</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Mail size={12} /> Email
                                    </label>
                                    <p className="text-sm font-bold text-gray-700">user@sekolah.sch.id</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin size={12} /> Lokasi Ambil
                                    </label>
                                    <p className="text-sm font-bold text-gray-700">Gedung Utama, Kantin</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 bg-gray-50/50 border-b border-gray-50">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest px-4">Pengaturan</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                <button className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Bell size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-black text-gray-900">Notifikasi</p>
                                            <p className="text-xs text-gray-500">Atur cara kami memberitahu pesananmu</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300" />
                                </button>
                                <button className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                            <Shield size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-black text-gray-900">Keamanan</p>
                                            <p className="text-xs text-gray-500">Ubah kata sandi dan proteksi akun</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 mt-4"
                        >
                            <LogOut size={20} /> Keluar dari Akun
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
