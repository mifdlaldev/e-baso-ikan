'use client';

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, LogOut, Package, ChevronRight, LayoutGrid, User, History, ShoppingCart } from 'lucide-react';
import Footer from '../../components/Footer';
import ReceiptModal from '../../components/ReceiptModal';

export default function OrdersPage() {
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

    // Helper to format price
    const formatPrice = (price) => {
        // If price is stored as "35" instead of "35000", multiply by 1000
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
                    <Link href="/orders" className="font-medium text-blue-600">Pesanan Saya</Link>
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
                                <Link href="/home" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                    <LayoutGrid size={16} /> Menu
                                </Link>
                                <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                    <User size={16} /> Profil
                                </Link>
                                <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 font-bold bg-blue-50 group hover:bg-blue-50 transition-colors">
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

            <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 lg:py-12">
                <div className="mb-10 text-center sm:text-left">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Daftar Pesanan</h1>
                    <p className="text-gray-500">Pantau status makananmu secara real-time.</p>
                </div>

                <div className="space-y-6">
                    {liveOrders.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <Package size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-bold">Belum ada pesanan.</p>
                            <Link href="/home" className="mt-4 inline-block text-blue-600 font-bold hover:underline">Pesan Sekarang</Link>
                        </div>
                    ) : (
                        liveOrders.map((order, idx) => (
                            <div key={idx} className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden hover:border-blue-100 transition-all">
                                <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 border-b border-gray-50">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ID Pesanan</p>
                                        <p className="font-bold text-gray-900">{order.id}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'Selesai' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row gap-8">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 text-gray-400 mb-4">
                                                <Package size={16} />
                                                <span className="text-xs font-bold uppercase tracking-wider">Item Pesanan</span>
                                            </div>
                                            <ul className="space-y-3">
                                                {order.items.map((item, idy) => (
                                                    <li key={idy} className="flex items-center gap-3 text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                        {item.quantity}x {item.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="sm:w-48 text-left sm:text-right border-t sm:border-t-0 sm:border-l border-gray-50 pt-6 sm:pt-0 sm:pl-8">
                                            <div className="mb-6">
                                                <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Waktu Pemesanan</p>
                                                <p className="text-sm font-bold text-gray-700">{order.date}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Total Bayar</p>
                                                <p className="text-xl font-black text-blue-600">Rp {formatPrice(order.total)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 sm:p-8 pt-0 flex justify-end">
                                    <button
                                        onClick={() => handleViewReceipt(order)}
                                        className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-all group"
                                    >
                                        Lihat Detail Struk <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
