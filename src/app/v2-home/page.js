'use client'

import React, { useState } from 'react';
import {
    ShoppingBag,
    Clock,
    CheckCircle2,
    ChefHat,
    Search,
    Bell,
    User,
    LogOut,
    ChevronRight,
    UtensilsCrossed,
    Receipt
} from 'lucide-react';

export default function CustomerDashboard() {
    // Mock Data
    const [orders, setOrders] = useState([
        {
            id: '#ORD-2023-001',
            date: 'Today, 10:30 AM',
            items: [
                { name: 'Baso Porsi Lengkap', qty: 2, price: 25000 },
                { name: 'Es Teh Manis', qty: 2, price: 5000 },
            ],
            total: 60000,
            status: 'cooking', // pending, cooking, ready, completed, cancelled
            paymentStatus: 'paid',
        },
        {
            id: '#ORD-2023-002',
            date: 'Today, 11:15 AM',
            items: [
                { name: 'Mie Yamin Baso', qty: 1, price: 22000 },
            ],
            total: 22000,
            status: 'pending',
            paymentStatus: 'unpaid',
        },
        {
            id: '#ORD-2023-003',
            date: 'Yesterday, 02:45 PM',
            items: [
                { name: 'Baso Goreng', qty: 5, price: 15000 },
            ],
            total: 15000,
            status: 'completed',
            paymentStatus: 'paid',
        }
    ]);

    // Stats Calculation
    const stats = [
        { label: 'Total Pesanan', value: orders.length, icon: ShoppingBag, color: 'bg-blue-500' },
        { label: 'Sedang Dimasak', value: orders.filter(o => o.status === 'cooking').length, icon: ChefHat, color: 'bg-orange-500' },
        { label: 'Siap Ambil', value: orders.filter(o => o.status === 'ready').length, icon: Bell, color: 'bg-green-500' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">Menunggu Konfirmasi</span>;
            case 'cooking':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">Sedang Dimasak</span>;
            case 'ready':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Siap Diambil</span>;
            case 'completed':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">Selesai</span>;
            case 'cancelled':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">Dibatalkan</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Unknown</span>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">

            {/* Sidebar */}
            <aside className="w-64 bg-blue-600 text-white flex flex-col shadow-xl z-20 sticky top-0 h-screen">
                <div className="p-6 flex items-center gap-3 border-b border-blue-500/30">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <UtensilsCrossed size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">E-Baso</h1>
                        <p className="text-xs text-blue-100 opacity-80">Online Ordering</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium transition-all hover:bg-white/20">
                        <Receipt size={20} />
                        <span>Pesanan Saya</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100 hover:bg-white/5 hover:text-white transition-all font-medium">
                        <ShoppingBag size={20} />
                        <span>Menu Utama</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100 hover:bg-white/5 hover:text-white transition-all font-medium">
                        <User size={20} />
                        <span>Profil</span>
                    </a>
                </nav>

                <div className="p-4 border-t border-blue-500/30">
                    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-blue-100 hover:bg-red-500/20 hover:text-red-100 transition-all font-medium group">
                        <LogOut size={20} className="group-hover:text-red-200" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">

                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-xl font-semibold text-gray-800">Riwayat Pesanan</h2>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            JD
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
                                <div className={`w-14 h-14 rounded-xl ${stat.color} flex items-center justify-center text-white shadow-lg shadow-blue-500/20`}>
                                    <stat.icon size={26} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-0.5">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Orders Table Section */}
                    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Pesanan Terbaru</h3>
                                <p className="text-sm text-gray-500">Pantau status pesanan anda secara realtime.</p>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari pesanan..."
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">ID Pesanan</th>
                                        <th className="px-6 py-4">Tanggal & Waktu</th>
                                        <th className="px-6 py-4">Menu</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-blue-600">
                                                {order.id}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-gray-400" />
                                                    {order.date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex flex-col gap-1">
                                                    {order.items.map((item, idx) => (
                                                        <span key={idx} className="text-sm">
                                                            {item.qty}x {item.name}
                                                        </span>
                                                    ))}
                                                    {order.items.length > 2 && <span className="text-xs text-gray-400 italic">+ {order.items.length - 2} more...</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-800">
                                                Rp {order.total.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-100">
                                                    <ChevronRight size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                Lihat Semua Pesanan
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
