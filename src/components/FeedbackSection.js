'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function FeedbackSection() {
    const [feedback, setFeedback] = useState('');
    const { addReport } = useCart();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (feedback.trim()) {
            addReport({
                type: 'Saran',
                message: feedback
            });
            alert('Terima kasih! Kritik dan saran Anda telah kami terima.');
            setFeedback('');
        } else {
            alert('Silakan tulis kritik atau saran Anda terlebih dahulu.');
        }
    };

    return (
        <section className="bg-blue-600 py-20 px-8 text-center text-white rounded-[3rem] mx-8 mb-20">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-4xl font-black mb-4 tracking-tight">Kritik dan Saran</h2>
                <p className="text-blue-100 mb-10 text-lg font-medium">
                    Masukkan masukan atau kritik Anda agar pelayanan kantin kami semakin baik.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tulis kritik atau saran Anda di sini..."
                        rows={4}
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md resize-none"
                    />
                    <button
                        type="submit"
                        className="w-full px-8 py-4 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                    >
                        Kirim Saran
                    </button>
                </form>
            </div>
        </section>
    );
}
