'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    LayoutDashboard,
    ShoppingBag,
    LogOut,
    Trash2,
    Edit,
    Clock,
    AlertCircle,
    Package,
    DollarSign,
    Search,
    ChevronDown,
    Power,
    MessageSquare,
    AlertTriangle
} from 'lucide-react';
import AdminReports from './AdminReports';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

export default function AdminDashboard() {
    const router = useRouter();
    const {
        orders, updateOrderStatus, deleteOrder,
        products, updateProduct, deleteProduct,
        reports, deleteReport
    } = useCart();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isProtectedRoute, setIsProtectedRoute] = useState(false);

    // Simple Route Protection
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user || JSON.parse(user).username !== 'admin') {
            router.push('/login');
        } else {
            setIsProtectedRoute(true);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    // State for processed chart data
    const [processedChartData, setProcessedChartData] = useState([]);

    // Data Processing Effect
    useEffect(() => {
        // Data Simulation (Dummy Data)
        const dummyData = [
            { label: '10 Feb', revenue: 120000 },
            { label: '11 Feb', revenue: 250000 },
            { label: '12 Feb', revenue: 180000 },
            { label: '13 Feb', revenue: 350000 },
            { label: '14 Feb', revenue: 300000 },
            { label: '15 Feb', revenue: 550000 },
            { label: '16 Feb', revenue: 420000 },
        ];

        // Function to Convert Orders to Recharts Format
        const convertOrdersToChartData = () => {
            const finishedOrders = orders.filter(o => o.status === 'Selesai');
            // if (finishedOrders.length === 0) return dummyData; // Removed this line to allow real data to show 0 if no orders

            // Group by Date using Intl.DateTimeFormat for labels
            const last7Days = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateKey = date.toLocaleDateString('en-GB'); // Key for matching (e.g., "DD/MM/YYYY")
                const dayLabel = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
                last7Days.push({ key: dateKey, label: dayLabel, revenue: 0 });
            }

            finishedOrders.forEach(order => {
                // Assuming order.date is in "DD/MM/YYYY, HH:MM" format
                const orderDateKey = order.date.split(',')[0].trim();
                const day = last7Days.find(d => d.key === orderDateKey);
                if (day) {
                    day.revenue += order.total;
                }
            });

            // If still no real revenue in last 7 days, fallback to dummy
            const totalRevenueLastWeek = last7Days.reduce((sum, d) => sum + d.revenue, 0);
            return totalRevenueLastWeek > 0 ? last7Days : dummyData;
        };

        setProcessedChartData(convertOrdersToChartData());
    }, [orders]);

    if (!isProtectedRoute) return null;

    // Stats Calculation
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Menunggu').length;
    const totalRevenue = orders
        .filter(o => o.status === 'Selesai')
        .reduce((sum, o) => sum + o.total, 0);

    const stats = [
        { label: 'Total Pesanan', value: totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pesanan Masuk', value: pendingOrders, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Total Pendapatan', value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Menunggu': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Diproses': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Selesai': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // Helper to format price
    const formatPrice = (price) => {
        const numericPrice = Number(price) || 0;
        // If price is stored as "35" instead of "35000", multiply by 1000
        const value = numericPrice < 1000 && numericPrice > 0 ? numericPrice * 1000 : numericPrice;
        return new Intl.NumberFormat('id-ID').format(value);
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-sm z-30">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">E</div>
                    <span className="font-bold text-xl text-gray-800 tracking-tight">Admin-Baso</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                    >
                        <ShoppingBag size={20} />
                        Pesanan
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                    >
                        <Package size={20} />
                        Daftar Produk
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                    >
                        <div className="flex items-center gap-3">
                            <MessageSquare size={20} />
                            Laporan & Saran
                        </div>
                        {reports.length > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'reports' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                                {reports.length}
                            </span>
                        )}
                    </button>
                </nav>

                <div className="p-6 border-t border-gray-50 text-center">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
                    >
                        <LogOut size={20} />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shrink-0 z-20 sticky top-0">
                    <h2 className="text-xl font-black text-gray-800 capitalize tracking-tight">
                        {activeTab === 'dashboard' ? 'Ringkasan Utama' : activeTab === 'reports' ? 'Laporan & Saran' : activeTab}
                    </h2>
                </header>

                <div className="flex-1 overflow-y-auto p-10 bg-gray-50/50">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-10">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 group hover:-translate-y-1 transition-all">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                                        <ShoppingBag size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pesanan</p>
                                        <p className="text-3xl font-black text-gray-900">{totalOrders}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 group hover:-translate-y-1 transition-all">
                                    <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
                                        <Clock size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pesanan Masuk</p>
                                        <p className="text-3xl font-black text-gray-900">{pendingOrders}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 group hover:-translate-y-1 transition-all">
                                    <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shadow-inner">
                                        <DollarSign size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pendapatan</p>
                                        <p className="text-3xl font-black text-gray-900">Rp {formatPrice(totalRevenue)}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 group hover:-translate-y-1 transition-all">
                                    <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
                                        <MessageSquare size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Laporan</p>
                                        <p className="text-3xl font-black text-gray-900">{reports.length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chart Section */}
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 mb-1">Tren Pendapatan</h3>
                                        <p className="text-sm text-gray-400 font-medium">Statistik penjualan harian (Hanya pesanan 'Selesai')</p>
                                    </div>
                                    <div className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl">7 Hari Terakhir</div>
                                </div>
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={processedChartData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis
                                                dataKey="label"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                                                tickFormatter={(value) => `Rp ${value / 1000}k`}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                                itemStyle={{ fontWeight: 800, color: '#1e40af' }}
                                                labelStyle={{ fontWeight: 700, marginBottom: '4px' }}
                                                formatter={(value) => [`Rp ${formatPrice(value)}`, 'Pendapatan']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#2563eb"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorRevenue)"
                                                dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                    <AlertCircle size={20} className="text-blue-600" />
                                    Pesanan Menunggu
                                </h3>
                                <div className="space-y-4">
                                    {orders.filter(o => o.status === 'Menunggu').slice(0, 5).map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm font-bold text-xs border border-gray-100">#</div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900">{order.id}</p>
                                                    <p className="text-xs text-gray-400 font-medium">{order.items.length} Menu • Rp {order.total.toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setActiveTab('orders')}
                                                className="px-4 py-2 bg-white text-blue-600 font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
                                            >
                                                Proses
                                            </button>
                                        </div>
                                    ))}
                                    {orders.filter(o => o.status === 'Menunggu').length === 0 && (
                                        <div className="py-10 text-center">
                                            <p className="text-gray-400 text-sm font-medium">Tidak ada pesanan menunggu.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-100">
                                <h3 className="text-lg font-black text-gray-900">Kelola Pesanan</h3>
                                <p className="text-sm text-gray-400 font-medium">Daftar semua pesanan dari pelanggan.</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Menu</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-blue-50/10">
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-black text-blue-600">{order.id}</span>
                                                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{order.date}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        {order.items.map((item, idx) => (
                                                            <span key={idx} className="text-sm font-bold text-gray-700">{item.quantity}x {item.name}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 font-black text-gray-900">
                                                    Rp {formatPrice(order.total)}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="relative inline-block">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                            className={`appearance-none px-4 py-2 pr-10 rounded-xl text-xs font-bold border outline-none transition-all cursor-pointer ${getStatusColor(order.status)}`}
                                                        >
                                                            <option value="Menunggu">Menunggu</option>
                                                            <option value="Diproses">Diproses</option>
                                                            <option value="Selesai">Selesai</option>
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-3 top-2.5 pointer-events-none opacity-50" />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => deleteOrder(order.id)}
                                                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Katalog Produk</h3>
                                    <p className="text-sm text-gray-400 font-medium">Kelola menu dan ketersediaan stok.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {products.map((product) => (
                                    <div key={product.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group">
                                        <div className="relative h-48 overflow-hidden bg-gray-100">
                                            <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                                            {!product.available && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                                    <span className="px-4 py-2 bg-red-500 text-white font-black text-xs rounded-full uppercase tracking-widest shadow-lg">Habis</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-8">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h4 className="font-black text-gray-900 text-lg mb-1">{product.name}</h4>
                                                    <p className="text-blue-600 font-black">Rp {formatPrice(product.price)}</p>
                                                </div>
                                                <button
                                                    onClick={() => updateProduct(product.id, { available: !product.available })}
                                                    className={`p-3 rounded-xl transition-all border ${product.available ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'}`}
                                                >
                                                    <Power size={20} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${product.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {product.available ? 'Tersedia' : 'Habis'}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button className="p-2.5 text-gray-400 hover:text-blue-600 transition-all"><Edit size={18} /></button>
                                                    <button onClick={() => deleteProduct(product.id)} className="p-2.5 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <AdminReports />
                    )}
                </div>
            </main>
        </div>
    );
}
