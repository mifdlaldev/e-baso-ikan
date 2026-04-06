'use client';

import { useState } from 'react';
import { MessageCircleHeart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FeedbackSection() {
    const [feedback, setFeedback] = useState('');
    const { addReport } = useCart();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!feedback.trim()) {
            alert('Tulis dulu masukanmu sebelum dikirim.');
            return;
        }

        await addReport({
            type: 'Saran',
            message: feedback
        });

        alert('Terima kasih, masukanmu sudah masuk ke dapur e-baso-ikan.');
        setFeedback('');
    };

    return (
        <section className="section-card overflow-hidden rounded-[40px] px-6 py-8 sm:px-10 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                <div>
                    <div className="mb-5 inline-flex rounded-3xl bg-[#1f2333] p-4 text-white">
                        <MessageCircleHeart size={24} />
                    </div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Suara pelanggan</p>
                    <h2 className="font-display text-4xl leading-tight text-[#1f2333] sm:text-5xl">
                        Mau rasa, tampilan, atau alur pesan yang lebih enak?
                    </h2>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-[#5b6170]">
                        Kirim masukanmu. Semua feedback kami simpan sebagai bahan perbaikan untuk pengalaman e-baso-ikan berikutnya.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="section-card rounded-[32px] border border-[rgba(31,35,51,0.08)] p-5 sm:p-6">
                    <textarea
                        value={feedback}
                        onChange={(event) => setFeedback(event.target.value)}
                        rows={5}
                        placeholder="Contoh: mau varian saus lebih banyak, foto produk lebih dekat, atau checkout dibuat lebih cepat."
                        className="min-h-40 w-full rounded-[26px] border border-[rgba(31,35,51,0.08)] bg-[#fffdf8] px-5 py-4 text-sm leading-7 text-[#1f2333] outline-none placeholder:text-[#8a8f9b] focus:border-[#1f5c57]"
                    />
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b6f7b]">
                            Feedback yang jelas akan lebih cepat kami tindak.
                        </p>
                        <button
                            type="submit"
                            className="rounded-full bg-[#d66b43] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(214,107,67,0.2)] hover:-translate-y-0.5"
                        >
                            Kirim Masukan
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
