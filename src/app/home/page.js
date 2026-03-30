'use client';

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, LogOut, LayoutGrid, User, ShoppingBag } from 'lucide-react';
import Footer from '../../components/Footer';
import FeedbackSection from '../../components/FeedbackSection';

export default function Home() {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const { addToCart, cartCount, menus, clearCart } = useCart();
    const router = useRouter();

    const handleBuyNow = (product) => {
        clearCart();
        addToCart(product);
        router.push('/checkout');
    };

    // Helper to format price
    const formatPrice = (price) => {
        const numericPrice = Number(price) || 0;
        // If price is stored as "35" instead of "35000", multiply by 1000
        const value = numericPrice < 1000 && numericPrice > 0 ? numericPrice * 1000 : numericPrice;
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const handleLogout = () => {
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">

            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">E</div>
                    <span className="font-bold text-xl text-gray-800 tracking-tight">E-Baso</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/home" className="font-medium text-blue-600">Menu</Link>
                    <Link href="/orders" className="font-medium text-gray-500 hover:text-blue-600 transition-colors">Pesanan Saya</Link>
                    <Link href="/history" className="font-medium text-gray-500 hover:text-blue-600 transition-colors">Riwayat</Link>
                    <Link href="/profile" className="font-medium text-gray-500 hover:text-blue-600 transition-colors">Profil</Link>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/cart" className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
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
                                <Link href="/home" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                    <LayoutGrid size={16} /> Menu
                                </Link>
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
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium">
                                    <LogOut size={16} /> Keluar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="flex flex-col lg:flex-row max-w-[1400px] mx-auto w-full gap-12 px-8 pt-16 pb-12">
                {/* Left Side: Hero Info */}
                <div className="w-full lg:w-[60%] flex flex-col justify-start lg:pt-8">
                    <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
                        Renyah, Panas, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Siap Disantap.</span>
                    </h1>
                    <p className="text-gray-500 text-base lg:text-lg mb-8 leading-relaxed max-w-xl">
                        Lewati antrian panjang kantin. Pesan jajanan favoritmu secara online dan ambil saat masih hangat.
                    </p>
                    <div className="flex items-center gap-8 border-t border-gray-100 pt-8">
                        <div>
                            <p className="text-3xl font-black text-gray-900">500+</p>
                            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase mt-1">Pesanan</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">15m</p>
                            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase mt-1">Waktu Siap</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">4.9</p>
                            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase mt-1">Rating</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Hero Image */}
                <div className="w-full lg:w-[40%] flex justify-center items-center mt-12 lg:mt-0">
                    <div className="relative w-full max-w-md aspect-[4/3] flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-400/10 blur-3xl rounded-full"></div>
                        <img
                            src="/images/animasi-baso-ikan.png"
                            alt="Baso Ikan"
                            className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:-translate-y-2 hover:scale-105 transition-all duration-500"
                        />
                    </div>
                </div>
            </div>

            {/* Menu Section */}
            <section className="max-w-[1400px] mx-auto w-full px-8 pb-16">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Daftar Menu</h2>
                        <p className="text-sm text-gray-500">Pilih menu satuan favoritmu di sini tanpa perlu pusing paket.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {menus.map(product => (
                        <div key={product.id} className={`group bg-white rounded-3xl p-5 transition-all duration-300 border border-gray-100 hover:border-blue-100 relative ${!product.available ? 'opacity-75' : 'hover:shadow-2xl hover:shadow-blue-900/10'}`}>
                            {product.popular && product.available && (
                                <span className="absolute top-8 left-8 z-20 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg shadow-orange-500/30">
                                    Populer
                                </span>
                            )}
                            {!product.available && (
                                <span className="absolute inset-0 z-30 bg-white/50 backdrop-blur-[2px] rounded-3xl flex items-center justify-center">
                                    <span className="px-6 py-3 bg-gray-900 text-white text-sm font-black rounded-full uppercase tracking-widest shadow-2xl">
                                        Habis
                                    </span>
                                </span>
                            )}
                            <Link href={product.available ? "/product-detail" : "#"} className={`relative mb-5 rounded-2xl overflow-hidden h-48 w-full bg-gray-50 block ${product.available ? 'group-hover:shadow-inner' : 'cursor-not-allowed grayscale'}`}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className={`object-cover w-full h-full transform transition-transform duration-700 ease-out ${product.available ? 'group-hover:scale-110' : ''}`}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-blue-900/5 transition-colors duration-500"></div>
                            </Link>
                            
                            <div className="flex flex-col h-[140px]">
                                <h3 className="font-black text-gray-900 text-lg leading-snug mb-1.5 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-auto">{product.description}</p>
                                
                                <div className="flex items-end justify-between mt-4 border-t border-gray-50 pt-4">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Harga</p>
                                        <span className="text-gray-900 font-black text-xl tracking-tight">Rp {formatPrice(product.price)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (product.available) addToCart(product);
                                            }}
                                            disabled={!product.available}
                                            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${product.available
                                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/30 active:scale-90 relative overflow-hidden'
                                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                }`}
                                            title="Tambah ke Keranjang"
                                        >
                                            <Plus size={20} className="relative z-10" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <FeedbackSection />
            <Footer />
        </div>
    );
}
