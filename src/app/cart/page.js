'use client';

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ShoppingBag,
    ChevronLeft,
    Trash2,
    Plus,
    Minus,
    LogOut,
    Heart,
    History,
    ShoppingCart,
    MapPin,
    ArrowRight
} from 'lucide-react';
import Footer from '../../components/Footer';

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart();
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    const formatPrice = (price) => {
        const numericPrice = Number(price) || 0;
        const value = numericPrice < 1000 && numericPrice > 0 ? numericPrice * 1000 : numericPrice;
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const subtotal = cartItems.reduce((total, item) => {
        const itemPrice = item.price || 0;
        return total + (itemPrice * item.quantity);
    }, 0);

    const deliveryFee = 2000;
    const total = subtotal + deliveryFee;

    const handleProceedToCheckout = () => {
        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900 pb-20">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">E</div>
                    <span className="font-bold text-xl text-gray-800 tracking-tight">E-Baso</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/home" className="font-medium text-gray-500 hover:text-blue-600 transition-colors">Menu</Link>
                    <Link href="/orders" className="font-medium text-gray-500 hover:text-blue-600 transition-colors">Pesanan Saya</Link>
                    <Link href="/history" className="font-medium text-gray-500 hover:text-blue-600 transition-colors">Riwayat</Link>
                    <Link href="/profile" className="font-medium text-gray-500 hover:text-blue-600 transition-colors">Profil</Link>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/cart" className="relative p-2.5 text-blue-600 bg-blue-50 rounded-xl">
                        <ShoppingCart size={22} />
                        {cartCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">{cartCount}</span>
                        )}
                    </Link>

                    <div className="relative">
                        <button
                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-50 rounded-full transition-all border border-transparent hover:border-gray-100"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden border border-white shadow-sm font-bold text-blue-600 text-xs">U</div>
                            <span className="text-sm font-bold text-gray-700 hidden sm:block">User</span>
                        </button>

                        {isUserDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-[60] transform origin-top-right transition-all">
                                <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">Profil</Link>
                                <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">Pesanan Saya</Link>
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

            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.push('/home')} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-blue-600 transition-all border border-transparent hover:border-gray-100">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-blue-900 tracking-tight">Keranjang Belanja</h1>
                        <p className="text-gray-500 text-sm font-medium">Tinjau pesananmu sebelum melanjutkan pembayaran.</p>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-xl shadow-blue-900/5">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={48} className="text-blue-200" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wah, keranjangmu masih kosong!</h2>
                        <p className="text-gray-500 mb-10 max-w-sm mx-auto">Yuk, cari baso ikan favoritmu dan mulai pesanan pertamamu hari ini.</p>
                        <Link href="/home" className="inline-flex items-center gap-3 bg-blue-600 text-white font-bold px-10 py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 hover:-translate-y-1">
                            Cari Menu Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-10 items-start">
                        {/* List Items */}
                        <div className="flex-1 w-full space-y-6">
                            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                        <ShoppingBag size={18} />
                                    </div>
                                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">Detail Pesanan</h2>
                                </div>

                                <div className="space-y-8">
                                    {cartItems.map((item, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-center gap-6 group">
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-50 shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="flex-1 w-full">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-black text-gray-900 text-lg leading-tight">{item.name}</h3>
                                                        <p className="text-xs text-blue-500 font-bold mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded-md italic">
                                                            Porsi Standar
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(index)}
                                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Hapus item"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <p className="font-black text-blue-600 text-xl">Rp {formatPrice(item.price)}</p>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-4 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                                        <button
                                                            onClick={() => updateQuantity(index, -1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-400 hover:text-blue-600 shadow-sm hover:shadow transition-all active:scale-90"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-6 text-center font-black text-gray-900">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(index, 1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-90"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-6 flex items-start gap-4">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">Lokasi Pengambilan</h4>
                                    <p className="text-sm text-blue-700 font-medium">Pesananmu bisa diambil di Kantin SMKN 1 Sumedang setelah konfirmasi pembayaran.</p>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Sidebar */}
                        <div className="w-full lg:w-[420px] shrink-0 sticky top-28">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-blue-900/5">
                                <h2 className="text-xl font-black text-blue-900 mb-8 flex items-center gap-3 uppercase tracking-tighter">
                                    Ringkasan Biaya
                                </h2>

                                <div className="space-y-5 mb-8">
                                    <div className="flex justify-between items-center text-gray-500 font-bold">
                                        <span className="text-sm">Total Harga ({cartCount} Menu)</span>
                                        <span className="text-gray-900">Rp {formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-500 font-bold">
                                        <span className="text-sm">Biaya Layanan</span>
                                        <span className="text-gray-900">Rp {formatPrice(deliveryFee)}</span>
                                    </div>
                                    <div className="h-px bg-gray-50 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-gray-900 text-lg">Total Bayar</span>
                                        <div className="text-right">
                                            <span className="block font-black text-blue-600 text-3xl">Rp {formatPrice(total)}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sudah termasuk pajak</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleProceedToCheckout}
                                    className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3 group group active:scale-95"
                                >
                                    Lanjut ke Pembayaran
                                    <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                </button>

                                <div className="mt-8 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                                        <Heart size={16} fill="currentColor" />
                                    </div>
                                    <p className="text-[10px] text-orange-700 font-bold leading-tight uppercase tracking-wider">
                                        Periksa kembali pesananmu sebelum lanjut ke tahap pembayaran.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
