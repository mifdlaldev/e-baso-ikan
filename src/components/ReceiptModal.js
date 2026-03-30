'use client';

import React from 'react';
import {
    X,
    Printer,
    CheckCircle2,
    ShoppingBag,
    User,
    Package,
    Calendar,
    ArrowRight
} from 'lucide-react';

export default function ReceiptModal({ order, onClose }) {
    if (!order) return null;

    const formatPrice = (price) => {
        const numericPrice = Number(price) || 0;
        const value = numericPrice < 1000 && numericPrice > 0 ? numericPrice * 1000 : numericPrice;
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const serviceFee = 1000;
    const total = subtotal + serviceFee;

    const handlePrint = () => {
        window.print();
    };

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300 no-print-backdrop"
            onClick={handleBackdropClick}
        >
            <style jsx global>{`
                @media print {
                    /* Hide everything except the receipt content */
                    body * {
                        visibility: hidden;
                        background: #ffffff !important;
                    }
                    .no-print, 
                    .no-print *,
                    nav, 
                    footer, 
                    button,
                    #receipt-print-btn,
                    #receipt-close-btn,
                    #receipt-actions {
                        display: none !important;
                    }
                    .no-print-backdrop {
                        background: #ffffff !important;
                        backdrop-filter: none !important;
                        position: static !important;
                        padding: 0 !important;
                        display: block !important;
                    }
                    #receipt-content {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        max-width: 400px;
                        margin: 0 auto;
                        box-shadow: none !important;
                        border: none !important;
                        background: #ffffff !important;
                    }
                    #receipt-content * {
                        visibility: visible;
                        color: #000000 !important;
                        -webkit-print-color-adjust: exact;
                    }
                    /* Remove margins from @page */
                    @page {
                        margin: 0;
                        size: auto;
                    }
                }
            `}</style>

            <div
                id="receipt-content"
                className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-[#1e3a8a33] overflow-hidden animate-in zoom-in-95 duration-300 relative border border-gray-100"
            >
                {/* Print Icon Shortcut */}
                <button
                    id="receipt-print-btn"
                    onClick={handlePrint}
                    className="absolute top-8 left-8 p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all z-[110]"
                    title="Cetak Struk"
                >
                    <Printer size={20} />
                </button>

                {/* Close Button */}
                <button
                    id="receipt-close-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute top-8 right-8 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all z-[110] relative"
                    style={{ zIndex: 100 }}
                    title="Tutup"
                >
                    <X size={20} />
                </button>

                <div className="p-10 pt-16">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-[#2563eb] rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-[#2563eb4d] mx-auto mb-4">
                            E
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">E-Baso Struk</h2>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-[#f0fdf4] text-[#16a34a] text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-[#dcfce7]">
                                <CheckCircle2 size={12} /> LUNAS
                            </span>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="space-y-6 mb-10">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">ID PESANAN</p>
                                <p className="text-sm font-bold text-gray-800 tracking-tight">{order.id}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">TANGGAL</p>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                                    <Calendar size={14} className="text-gray-400" />
                                    {order.date}
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RINCIAN MENU</p>
                            <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-gray-600">
                                            {item.quantity}x <span className="text-gray-900 font-bold">{item.name}</span>
                                        </span>
                                        <span className="font-black text-gray-900">Rp {formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Method */}
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">METODE PENERIMAAN</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm border border-gray-100">
                                    {order.deliveryMethod === 'delivery' ? <Package size={16} /> : <User size={16} />}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-[#1e3a8a] uppercase">
                                        {order.deliveryMethod === 'delivery' ? 'Antar ke Kelas' : 'Ambil Sendiri'}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-bold">
                                        {order.deliveryMethod === 'delivery' ? (
                                            <>Lokasi: <span className="text-gray-700">{order.classRoom || 'Lab Komputer'}</span></>
                                        ) : (
                                            'Kantin SMKN 1 Sumedang'
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="space-y-2 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-xs font-bold text-gray-500">
                                <span>Subtotal</span>
                                <span className="text-gray-900">Rp {formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-gray-500">
                                <span>Biaya Layanan</span>
                                <span className="text-gray-900">Rp {formatPrice(serviceFee)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-black text-gray-900">TOTAL BAYAR</span>
                                <span className="text-xl font-black text-[#2563eb]">Rp {formatPrice(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div id="receipt-actions" className="grid grid-cols-2 gap-4 mt-6">
                        <button
                            onClick={handlePrint}
                            className="bg-[#2563eb] text-white font-black py-4 rounded-2xl hover:bg-[#1d4ed8] transition-all shadow-xl shadow-[#2563eb33] active:scale-95 flex items-center justify-center gap-2 group z-[110]"
                        >
                            <Printer size={18} />
                            <span className="text-sm">Cetak Struk</span>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="bg-gray-100 text-gray-900 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2 group z-[110] relative"
                            style={{ zIndex: 100 }}
                        >
                            <span className="text-sm text-gray-600">Tutup</span>
                            <ArrowRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <p className="text-center text-[8px] text-gray-300 font-bold uppercase tracking-[0.3em] mt-8">
                        Terima kasih atas pesanan Anda!
                    </p>
                </div>
            </div>
        </div>
    );
}
