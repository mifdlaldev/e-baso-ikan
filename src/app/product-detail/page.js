'use client';

import React, { useState } from 'react';
import {
    ArrowLeft,
    Flame,
    Timer,
    Leaf,
    Plus,
    Minus,
    ShoppingCart,
    ShoppingBag,
    History,
    LayoutGrid,
    User,
    LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';

export default function ProductDetail() {
    const { addToCart, cartCount } = useCart();
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const router = useRouter();

    const [namaPembeli, setNamaPembeli] = useState('');
    const [extras, setExtras] = useState({
        spicySauce: false,
        extraCup: false
    });

    const basePrice = 25000;
    const extraSaucePrice = 3000;
    const extraCupPrice = 2000;

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    const toggleExtra = (key) => {
        setExtras(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const calculateSubtotal = () => basePrice * quantity;
    const calculateAddons = () => {
        let total = 0;
        if (extras.spicySauce) total += extraSaucePrice * quantity;
        if (extras.extraCup) total += extraCupPrice * quantity;
        return total;
    };
    const calculateTotal = () => calculateSubtotal() + calculateAddons();

    const handleAddToOrder = () => {
        if (!namaPembeli.trim()) {
            alert('Silakan isi Nama Lengkap Pemesan terlebih dahulu.');
            return;
        }

        const itemExtras = [];
        if (extras.spicySauce) itemExtras.push('Ekstra Saus Pedas');
        if (extras.extraCup) itemExtras.push('Ekstra Cup');

        addToCart({
            id: 'baso-pedas-trio',
            name: 'Paket Trio Baso Ikan Pedas',
            price: basePrice + (extras.spicySauce ? extraSaucePrice : 0) + (extras.extraCup ? extraCupPrice : 0),
            quantity: quantity,
            image: "https://placehold.co/800x600/1e40af/ffffff?text=Paket+Baso+Pedas",
            extras: itemExtras,
            nama_pembeli: namaPembeli
        });
        router.push('/cart');
    };

    const formatPrice = (price) => {
        const numericPrice = Number(price) || 0;
        const value = numericPrice < 1000 && numericPrice > 0 ? numericPrice * 1000 : numericPrice;
        return new Intl.NumberFormat('id-ID').format(value);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">E</div>
                    <span className="font-bold text-xl text-gray-800 tracking-tight">E-Baso</span>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
                    <Link href="/home" className="hover:text-blue-600 transition-colors">Menu</Link>
                    <Link href="/orders" className="hover:text-blue-600 transition-colors">Pesanan Saya</Link>
                    <Link href="/history" className="hover:text-blue-600 transition-colors">Riwayat</Link>
                    <Link href="/profile" className="hover:text-blue-600 transition-colors">Profil</Link>
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
                            className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-50 rounded-full transition-all border border-transparent hover:border-gray-100"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden border border-white shadow-sm font-bold text-blue-600 text-xs">U</div>
                            <span className="text-sm font-bold text-gray-700 hidden sm:block">User</span>
                        </button>

                        {isUserDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-[60] transform origin-top-right transition-all">
                                <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
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

            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
                {/* Back Button */}
                <Link href="/home" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all mb-8 lg:mb-10 font-bold text-xs sm:text-sm bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-gray-100">
                    <ArrowLeft size={16} />
                    Kembali ke Menu
                </Link>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

                    {/* Left Column - Product Image & Info */}
                    <div className="flex-1 w-full text-center lg:text-left">
                        <div className="relative rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/5 mb-6 lg:mb-8 aspect-[4/3] group border-4 border-white">
                            <span className="absolute top-4 left-4 lg:top-6 lg:left-6 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] lg:text-xs font-bold px-3 py-1.5 lg:px-4 lg:py-2 rounded-full z-10 shadow-lg shadow-orange-500/30 tracking-wider uppercase">
                                Terlaris
                            </span>
                            <img
                                src="https://placehold.co/800x600/1e40af/ffffff?text=Paket+Baso+Pedas"
                                alt="Paket Trio Baso Ikan Pedas"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">Paket Trio Baso Ikan Pedas</h1>
                        <p className="text-gray-500 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">Jajanan favorit klasik disajikan dengan cuka manis & pedas khas kami. Cocok untuk dinikmati ramai-ramai.</p>

                        {/* Info Cards */}
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2 hover:border-blue-100 transition-colors">
                                <div className="p-2 bg-orange-50 rounded-full text-orange-500 mb-1">
                                    <Flame size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kalori</span>
                                <span className="font-bold text-gray-800">240 kkal</span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2 hover:border-blue-100 transition-colors">
                                <div className="p-2 bg-blue-50 rounded-full text-blue-500 mb-1">
                                    <Timer size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu</span>
                                <span className="font-bold text-gray-800">5-7 mnt</span>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2 hover:border-blue-100 transition-colors">
                                <div className="p-2 bg-green-50 rounded-full text-green-500 mb-1">
                                    <Leaf size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Segar</span>
                                <span className="font-bold text-gray-800">Tiap Hari</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Customization */}
                    <div className="w-full lg:w-[420px] flex-shrink-0">
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sticky top-28">
                            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Sesuaikan</h2>
                                    <p className="text-sm text-gray-400">Pilih tambahan favoritmu.</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-black text-blue-600">Rp {formatPrice(basePrice)}</span>
                                    <span className="text-xs text-gray-400 font-medium">per porsi</span>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Jumlah Pesanan</label>
                                <div className="flex items-center justify-between bg-gray-50/50 rounded-2xl p-2 border border-blue-50/50">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm hover:shadow-md hover:text-blue-600 transition-all disabled:opacity-50"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="w-12 text-center font-black text-xl text-gray-900">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all hover:shadow-blue-600/40 hover:-translate-y-0.5"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <span className="font-bold text-gray-900 text-lg mr-2">Rp {formatPrice(basePrice * quantity)}</span>
                                </div>
                            </div>

                            {/* Popular Add-ons */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Tambahan Populer</label>
                                <div className="space-y-3">
                                    <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 group ${extras.spicySauce ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${extras.spicySauce ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white group-hover:border-blue-400'}`}>
                                                {extras.spicySauce && <Plus size={14} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={extras.spicySauce}
                                                onChange={() => toggleExtra('spicySauce')}
                                            />
                                            <span className="text-sm font-bold text-gray-700">Ekstra Saus Pedas</span>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600">+ Rp {formatPrice(extraSaucePrice)}</span>
                                    </label>

                                    <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 group ${extras.extraCup ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${extras.extraCup ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white group-hover:border-blue-400'}`}>
                                                {extras.extraCup && <Plus size={14} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={extras.extraCup}
                                                onChange={() => toggleExtra('extraCup')}
                                            />
                                            <span className="text-sm font-bold text-gray-700">Ekstra Cup</span>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600">+ Rp {formatPrice(extraCupPrice)}</span>
                                    </label>
                                </div>
                            </div>

                            {/* Nama Pemesan */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Nama Lengkap Pemesan <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={namaPembeli}
                                    onChange={(e) => setNamaPembeli(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
                                    placeholder="Masukkan nama lengkap Anda..."
                                />
                            </div>

                            {/* Special Instructions */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Catatan Khusus</label>
                                <textarea
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none h-28 placeholder-gray-400"
                                    placeholder="Contoh: Pisahkan sausnya, jangan terlalu pedas..."
                                ></textarea>
                            </div>

                            {/* Summary & Button */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Subtotal</span>
                                        <span className="font-medium">Rp {formatPrice(calculateSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>Tambahan</span>
                                        <span className="font-medium">Rp {formatPrice(calculateAddons())}</span>
                                    </div>
                                    <div className="h-px bg-gray-200 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900">Total Bayar</span>
                                        <span className="font-black text-2xl text-blue-600">Rp {formatPrice(calculateTotal())}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToOrder}
                                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 group hover:-translate-y-1"
                                >
                                    Tambah ke Pesanan
                                    <ArrowLeft size={20} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-20 text-center text-gray-400 text-sm py-8 border-t border-gray-100 bg-white">
                &copy; 2023 Sistem Kantin E-Baso. Hak cipta dilindungi.
            </footer>
        </div>
    );
}
