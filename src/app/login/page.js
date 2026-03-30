'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, Utensils } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin') {
            localStorage.setItem('user', JSON.stringify({ username: 'admin' }));
            router.push('/admin');
        } else if (username === 'user') {
            localStorage.setItem('user', JSON.stringify({ username: 'user' }));
            router.push('/home');
        } else {
            setError('Username salah! Coba "admin" atau "user".');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-8 text-center">
                    <div className="inline-flex flex-col items-center mb-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-900/20">
                            <Utensils size={32} className="text-blue-900" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-xl font-black tracking-wider leading-none">E-BASO</h2>
                            <p className="text-[10px] font-bold tracking-[0.3em] leading-none mt-1 opacity-90">KANTIN</p>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Selamat Datang di E-Baso</h1>
                    <p className="text-blue-100">Silakan login terlebih dahulu</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Username</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
                                    placeholder="Enter your username"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group"
                        >
                            Masuk Sekarang
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>


                </div>
            </div>
        </div>
    );
}
