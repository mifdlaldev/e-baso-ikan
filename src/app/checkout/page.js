'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    ShoppingBag,
    MessageSquare,
    CreditCard,
    Wallet,
    Banknote,
    QrCode,
    Info,
    ShieldCheck,
    Clock,
    CheckCircle2,
    Package,
    User
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const { cartItems: contextCartItems, cartCount: contextCartCount, checkout, clearCart } = useCart();
    // Safety check as requested
    const cartItems = contextCartItems || [];
    const cartCount = contextCartCount || 0;

    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderNote, setOrderNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('saldo');
    const [deliveryMethod, setDeliveryMethod] = useState('pickup');
    const [classRoom, setClassRoom] = useState('');
    const [classError, setClassError] = useState(false);
    const [namaPembeli, setNamaPembeli] = useState('');

    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const serviceFee = 1000;
    const tax = 0;
    const total = subtotal + serviceFee + tax;

    useEffect(() => {
        if (cartCount === 0 && !isSuccess) {
            // Handle empty cart
        }
    }, [cartCount, isSuccess]);

    const handleConfirmPayment = () => {
        if (deliveryMethod === 'delivery' && !classRoom.trim()) {
            setClassError(true);
            const input = document.getElementById('classRoomInput');
            if (input) input.focus();
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            const orderId = checkout({
                note: orderNote,
                paymentMethod,
                deliveryMethod,
                classRoom: deliveryMethod === 'delivery' ? classRoom : null,
                nama_pembeli: namaPembeli
            });
            setIsProcessing(false);
            if (orderId) {
                setIsSuccess(true);
                setTimeout(() => {
                    router.push('/orders');
                }, 2000);
            }
        }, 1500);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID').format(price);
    };

    if (cartCount === 0 && !isSuccess) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={48} className="text-blue-400" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Belum Ada Pesanan</h1>
                <p className="text-gray-500 mb-8 text-center max-w-xs font-medium">Selesaikan pesanan baso favoritmu di kantin sekolah dengan memilih menu terlebih dahulu.</p>
                <Link href="/home" className="bg-blue-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all hover:-translate-y-1 active:scale-95">
                    Kembali ke Menu
                </Link>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Pembayaran Berhasil!</h1>
                <p className="text-gray-500 text-center max-w-sm mb-8 font-medium">Pesananmu sedang diproses oleh tim E-Baso. Kamu akan segera diarahkan ke halaman pesanan.</p>
                <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 animate-[loading_2s_linear]"></div>
                </div>
                <style jsx>{` @keyframes loading { from { width: 0%; } to { width: 100%; } } `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans text-gray-900 pb-20">
            {/* Header / Navbar Ref */}
            <nav className="h-20 bg-white border-b border-gray-100/50 sticky top-0 z-50 flex items-center px-10 justify-between">
                <Link href="/home" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L4 9V21H20V9L12 2Z" fill="white" />
                        </svg>
                    </div>
                    <span className="font-black text-xl text-blue-900 tracking-tight">E-Baso <span className="text-blue-500">Kantin</span></span>
                </Link>
                <div className="flex items-center gap-8 text-sm font-bold text-gray-500">
                    <Link href="/home" className="hover:text-blue-600 transition-colors">Menu</Link>
                    <Link href="/orders" className="hover:text-blue-600 transition-colors">Pesanan Saya</Link>
                    <Link href="/history" className="hover:text-blue-600 transition-colors text-blue-600">Riwayat</Link>
                    <div className="flex items-center gap-4 ml-4">
                        <div className="p-2 bg-gray-50 rounded-full text-gray-400">
                            <ShoppingCart size={20} />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-orange-200 border-2 border-white shadow-sm overflow-hidden p-1">
                            <div className="bg-orange-300 w-full h-full rounded-full flex items-center justify-center text-[10px] font-black text-white">JD</div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-10 py-6">
                <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                    <Link href="/home" className="hover:text-blue-600 transition-colors">Beranda</Link>
                    <ChevronRight size={12} />
                    <Link href="/cart" className="hover:text-blue-600 transition-colors">Keranjang</Link>
                    <ChevronRight size={12} />
                    <span className="text-blue-600">Pembayaran</span>
                </div>

                <div className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Konfirmasi Pembayaran</h1>
                    <p className="text-gray-500 font-medium text-lg">Selesaikan pesanan baso favoritmu di kantin sekolah.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left Section */}
                    <div className="flex-1 space-y-10">

                        {/* Detail Pesanan Card */}
                        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                            <div className="p-8 border-b border-gray-50/50 flex items-center justify-between bg-white">
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-4">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <ShoppingBag size={22} />
                                    </div>
                                    Detail Pesanan
                                </h3>
                                <div className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                                    {cartCount} Item
                                </div>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left">
                                    <thead className="bg-[#FAFBFE] text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                                        <tr>
                                            <th className="px-10 py-5">Menu</th>
                                            <th className="px-10 py-5 text-center">Jumlah</th>
                                            <th className="px-10 py-5 text-right">Harga</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50/50">
                                        {cartItems && cartItems.length > 0 && cartItems.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-lg mb-1">{item.name}</p>
                                                            <p className="text-xs text-gray-400 font-medium">Level Pedas: 3</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-center">
                                                    <span className="font-bold text-gray-600 text-lg">{item.quantity}</span>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <span className="font-black text-blue-600 text-xl tracking-tight">Rp {formatPrice(item.price * item.quantity)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Delivery Method Card */}
                        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                            <div className="p-8">
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-4 mb-8">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Info size={22} />
                                    </div>
                                    Metode Penerimaan
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div
                                        onClick={() => { setDeliveryMethod('pickup'); setClassError(false); }}
                                        className={`p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer flex items-center gap-5 ${deliveryMethod === 'pickup' ? 'border-blue-600 bg-blue-50/10' : 'border-gray-100 hover:border-blue-200 bg-white'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm shrink-0 ${deliveryMethod === 'pickup' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <p className={`font-black text-sm mb-1 ${deliveryMethod === 'pickup' ? 'text-blue-900' : 'text-gray-900'}`}>Ambil Sendiri</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Ambil di Kantin</p>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setDeliveryMethod('delivery')}
                                        className={`p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer flex items-center gap-5 ${deliveryMethod === 'delivery' ? 'border-blue-600 bg-blue-50/10' : 'border-gray-100 hover:border-blue-200 bg-white'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm shrink-0 ${deliveryMethod === 'delivery' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <p className={`font-black text-sm mb-1 ${deliveryMethod === 'delivery' ? 'text-blue-900' : 'text-gray-900'}`}>Antar ke Kelas</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Diantar ke lokasimu</p>
                                        </div>
                                    </div>
                                </div>

                                {deliveryMethod === 'delivery' ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">
                                            Masukkan Nama Kelas/Ruangan <span className="text-red-500">* Wajib diisi</span>
                                        </label>
                                        <p className="text-[10px] text-gray-400 font-medium ml-1 -mt-1 italic">
                                            Sebutkan jurusan dan nomor kelas secara lengkap agar pengirim tidak bingung.
                                        </p>
                                        <input
                                            id="classRoomInput"
                                            type="text"
                                            placeholder="Contoh: XII RPL 1 atau Lab Komputer 2"
                                            className={`w-full p-5 bg-gray-50 border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${classError ? 'border-red-500 bg-red-50/20' : 'border-gray-100 focus:border-blue-500'}`}
                                            value={classRoom}
                                            onChange={(e) => { setClassRoom(e.target.value); setClassError(false); }}
                                        />
                                        {classError && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">Lokasi tujuan tidak boleh kosong</p>}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
                                        <p className="text-xs text-blue-800 font-bold leading-relaxed">
                                            Silakan ambil di kantin jika status pesanan sudah <span className="text-blue-600 uppercase">Ready</span>. Tunjukkan struk digitalmu ke petugas.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Catatan Pesanan Card */}
                        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                            <div className="p-8 pb-4">
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-4">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <MessageSquare size={22} />
                                    </div>
                                    Catatan Pesanan
                                </h3>
                            </div>
                            <div className="p-8 pt-4">
                                <textarea
                                    placeholder="Contoh: Tanpa seledri, baso dipisah, atau minta mangkuk tambahan..."
                                    className="w-full h-32 p-6 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                ></textarea>
                            </div>
                        </section>

                        {/* Metode Pembayaran Card */}
                        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                            <div className="p-8">
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-4 mb-8">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <CreditCard size={22} />
                                    </div>
                                    Metode Pembayaran
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Saldo Option */}
                                    <div
                                        onClick={() => setPaymentMethod('saldo')}
                                        className={`p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer group ${paymentMethod === 'saldo' ? 'border-blue-600 bg-blue-50/10' : 'border-gray-100 hover:border-blue-200 bg-white'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors ${paymentMethod === 'saldo' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50'}`}>
                                            <Wallet size={24} />
                                        </div>
                                        <p className={`font-black text-sm mb-1 ${paymentMethod === 'saldo' ? 'text-blue-900' : 'text-gray-900'}`}>Saldo Siswa</p>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Sisa: Rp 45.000</p>
                                    </div>

                                    {/* Tunai Option */}
                                    <div
                                        onClick={() => setPaymentMethod('tunai')}
                                        className={`p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer group ${paymentMethod === 'tunai' ? 'border-blue-600 bg-blue-50/10' : 'border-gray-100 hover:border-blue-200 bg-white'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors ${paymentMethod === 'tunai' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50'}`}>
                                            <Banknote size={24} />
                                        </div>
                                        <p className={`font-black text-sm mb-1 ${paymentMethod === 'tunai' ? 'text-blue-900' : 'text-gray-900'}`}>Tunai di Kantin</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bayar saat ambil</p>
                                    </div>

                                    {/* QRIS Option */}
                                    <div
                                        onClick={() => setPaymentMethod('qris')}
                                        className={`p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer group ${paymentMethod === 'qris' ? 'border-blue-600 bg-blue-50/10' : 'border-gray-100 hover:border-blue-200 bg-white'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors ${paymentMethod === 'qris' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50'}`}>
                                            <QrCode size={24} />
                                        </div>
                                        <p className={`font-black text-sm mb-1 ${paymentMethod === 'qris' ? 'text-blue-900' : 'text-gray-900'}`}>QRIS / E-Wallet</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-[8px]">Gopay, OVO, Dana</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Section (Sticky) */}
                    <div className="lg:w-[420px] space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] overflow-hidden sticky top-32">
                            <div className="p-10">
                                <h3 className="text-2xl font-black text-gray-900 mb-8">Ringkasan Biaya</h3>

                                <div className="space-y-6 mb-10">
                                    <div className="flex justify-between items-center text-gray-500 font-bold">
                                        <span className="text-sm">Subtotal Pesanan</span>
                                        <span className="text-gray-900 text-lg">Rp {formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-500 font-bold">
                                        <span className="text-sm">Biaya Layanan</span>
                                        <span className="text-gray-900">Rp {formatPrice(serviceFee)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-500 font-bold">
                                        <span className="text-sm">Pajak Resto (0%)</span>
                                        <span className="text-gray-900">Rp 0</span>
                                    </div>

                                    <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">Total Pembayaran</span>
                                        <span className="text-blue-600 font-black text-3xl tracking-tight">Rp {formatPrice(total)}</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nama Pemesan</label>
                                    <input 
                                        type="text" 
                                        value={namaPembeli} 
                                        onChange={(e) => setNamaPembeli(e.target.value)} 
                                        placeholder="Masukkan nama pemesan..."
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={isProcessing}
                                    className={`w-full h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-4 relative overflow-hidden group shadow-2xl ${isProcessing
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#1E4DBC] text-white hover:bg-blue-800 shadow-blue-900/40 hover:-translate-y-1 active:scale-95'
                                        }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            Pesan Sekarang
                                            <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                                    <ShieldCheck size={14} className="text-gray-300" />
                                    Transaksi aman & terenkripsi oleh sistem sekolah
                                </div>
                            </div>
                        </div>

                        {/* Tips Box */}
                        <div className="p-8 bg-[#EBF0FF] rounded-[2rem] border border-blue-100 flex gap-5">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
                                <Info size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-blue-900 text-xs">Tips Kantin:</p>
                                <p className="text-[10px] text-blue-700 font-bold leading-relaxed uppercase tracking-wider">
                                    Gunakan Saldo Siswa untuk proses pengambilan pesanan lebih cepat tanpa harus mengantri di kasir.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Footer Ref */}
            <div className="mt-20 py-10 border-t border-gray-50 text-center flex flex-col items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-4 h-4 text-gray-300"><ShoppingCart size={16} /></div>
                    <span className="text-xs font-bold text-gray-400">© 2024 E-Baso Kantin Sekolah. Semua Hak Dilindungi.</span>
                </div>
                <div className="flex items-center gap-6 text-gray-300">
                    <Info size={20} className="hover:text-blue-600 cursor-pointer" />
                    <ShoppingBag size={20} className="hover:text-blue-600 cursor-pointer" />
                    <CreditCard size={20} className="hover:text-blue-600 cursor-pointer" />
                </div>
            </div>
        </div>
    );
}
