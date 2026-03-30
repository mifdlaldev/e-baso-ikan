'use client';

import React from 'react';
import { useCart } from '../../context/CartContext';
import { Trash2, CheckCircle, Clock, AlertTriangle, MessageSquare } from 'lucide-react';

export default function AdminReports() {
    const { reports, deleteReport, updateReportStatus } = useCart();

    React.useEffect(() => {
        console.log('Current Reports in Admin Dashboard:', reports);
    }, [reports]);

    const formatDate = (date) => {
        return new Date(date).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
            deleteReport(id);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Manajemen Laporan & Saran</h2>
                    <p className="text-gray-500 text-sm">Kelola semua kritik, saran, dan kendala dari pelanggan.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 font-bold text-sm">
                    <MessageSquare size={18} />
                    {reports.length} Total Laporan
                </div>
            </div>

            {reports.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-16 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Semua Beres!</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">Belum ada laporan atau saran baru yang masuk saat ini.</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Waktu</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipe & Kategori</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-1/2">Pesan</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reports.map((report) => (
                                    <tr
                                        key={report.id}
                                        className={`hover:bg-blue-50/30 transition-all group ${report.status === 'Selesai' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                                    >
                                        <td className="px-8 py-6">
                                            <div className={`flex items-center gap-2 font-medium text-sm ${report.status === 'Selesai' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <Clock size={14} className="text-gray-400" />
                                                {formatDate(report.timestamp)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${report.status === 'Selesai'
                                                    ? 'bg-green-100 text-green-700'
                                                    : report.type === 'BANTUAN' || report.type === 'Saran'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {report.status === 'Selesai' ? 'Selesai' : report.type}
                                                </span>
                                                <p className={`text-sm font-bold ${report.status === 'Selesai' ? 'text-gray-400 line-through decoration-1' : 'text-gray-800'}`}>
                                                    {report.category || 'Feedback Umum'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${report.status === 'Selesai' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {report.message}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3">
                                                {report.status !== 'Selesai' && (
                                                    <button
                                                        onClick={() => updateReportStatus(report.id, 'Selesai')}
                                                        className="p-2.5 text-green-500 hover:bg-green-50 rounded-xl transition-all hover:scale-110 active:scale-95 group/btn relative"
                                                        title="Tandai Selesai"
                                                    >
                                                        <CheckCircle size={20} />
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Selesai</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(report.id)}
                                                    className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 active:scale-95 group/btn relative"
                                                    title="Hapus Laporan"
                                                >
                                                    <Trash2 size={20} />
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Hapus</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
