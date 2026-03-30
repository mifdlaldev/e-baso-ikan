'use client';

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ShoppingBag,
    LogOut,
    ChevronRight,
    LayoutGrid,
    User,
    History,
    Calendar,
    CheckCircle2,
    Clock,
    ShoppingCart
} from 'lucide-react';
import Footer from '../../components/Footer';
import ReceiptModal from '../../components/ReceiptModal';

export default function HistoryPage() {
    const { cartCount, orders: liveOrders } = useCart();
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleViewReceipt = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    const formatPrice = (price) => {
        const value = price < 1000 ? price * 1000 : price;
        return new Intl.NumberFormat('id-ID').format(value);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">E</div>
                    <span className="font-bold text-xl text-gray-800 tracking-tight">E-Baso</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/home" className="font-medium text-gray-500 hover:text-blue-600 transition-colors">Menu</Link>
                    <Link href="/orders" className="font-medium text-gray-500 hover:text-blue-600 transition-colors">Pesanan Saya</Link>
                    <Link href="/history" className="font-medium text-blue-600">Riwayat</Link>
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
                                <Link href="/history" className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 font-bold bg-blue-50 group hover:bg-blue-50 transition-colors">
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

            <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
                <div className="mb-10 text-center sm:text-left">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Riwayat Pesanan</h1>
                    <p className="text-gray-500">Daftar semua pesanan yang pernah kamu buat.</p>
                </div>

                <div className="space-y-4">
                    {liveOrders.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <History size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-bold">Belum ada riwayat pesanan.</p>
                            <Link href="/home" className="mt-4 inline-block text-blue-600 font-bold hover:underline">Mulai Belanja</Link>
                        </div>
                    ) : (
                        liveOrders.map((order, idx) => (
                            <div key={idx} className="bg-white rounded-[1.5rem] border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg transition-all border-l-4 border-l-blue-600">
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                        <History size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{order.date}</p>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">{order.items.length} Menu dipesan</h3>
                                        <div className="flex flex-wrap gap-2 items-center mb-1">
                                            <p className="text-sm text-gray-500 font-medium truncate max-w-[200px]">
                                                {order.items.map(i => i.name).join(', ')}
                                            </p>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md ${order.deliveryMethod === 'delivery' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {order.deliveryMethod === 'delivery' ? `Antar: ${order.classRoom}` : 'Ambil Sendiri'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
                                        <p className="font-black text-blue-600 text-lg">Rp {formatPrice(order.total)}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${order.status === 'Selesai' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                        }`}>
                                        {order.status === 'Selesai' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                        {order.status}
                                    </div>
                                    <button
                                        onClick={() => handleViewReceipt(order)}
                                        className="p-2 hover:bg-gray-50 rounded-full transition-all text-gray-400 hover:text-blue-600"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {isModalOpen && (
                <ReceiptModal
                    order={selectedOrder}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedOrder(null);
                    }}
                />
            )}

            <Footer />
        </div>
    );
}
