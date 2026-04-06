'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    BarChart3,
    Boxes,
    ChefHat,
    Eye,
    MessageSquareQuote,
    PencilLine,
    Plus,
    RefreshCcw,
    ShieldAlert,
    Store,
    Trash2,
    Upload,
    Users2,
    X
} from 'lucide-react';
import SiteFooter from '../../components/SiteFooter';
import SiteHeader from '../../components/SiteHeader';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatOrderDate, formatPaymentMethodLabel } from '../../lib/formatters';
import { getSupabaseBrowserClient } from '../../lib/supabase/client';

const orderStatuses = ['Menunggu', 'Diproses', 'Siap Diambil', 'Selesai', 'Dibatalkan'];
const reportStatuses = ['Baru', 'Ditinjau', 'Selesai'];
const profileRoles = ['customer', 'admin'];
const tableTabs = [
    { key: 'products', label: 'Produk', icon: Boxes },
    { key: 'reports', label: 'Feedback', icon: MessageSquareQuote },
    { key: 'profiles', label: 'User', icon: Users2 }
];

function slugify(value = '') {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function createProductForm(product = {}) {
    return {
        id: product.id ?? '',
        name: product.name ?? '',
        slug: product.slug ?? '',
        short_name: product.short_name ?? product.shortName ?? '',
        category: product.category ?? '',
        price: product.price ?? 0,
        sort_order: product.sort_order ?? 1,
        description: product.description ?? '',
        long_description: product.long_description ?? product.longDescription ?? '',
        serving_note: product.serving_note ?? product.servingNote ?? '',
        image_url: product.image_url ?? product.image ?? '',
        accent_gradient: product.accent_gradient ?? product.accent ?? 'from-[#1f5c57] via-[#2d7a72] to-[#8abfa7]',
        calories_label: product.calories_label ?? product.calories ?? '',
        prep_time_label: product.prep_time_label ?? product.prepTime ?? '',
        freshness_label: product.freshness_label ?? product.freshness ?? '',
        is_featured: Boolean(product.is_featured ?? product.popular),
        is_available: product.is_available ?? product.available ?? true
    };
}

function createReportForm(report = {}) {
    return {
        id: report.id,
        report_type: report.report_type ?? 'Saran',
        message: report.message ?? '',
        status: report.status ?? 'Baru',
        created_at: report.created_at
    };
}

function createProfileForm(profile = {}) {
    return {
        id: profile.id,
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
        role: profile.role ?? 'customer',
        is_active: profile.is_active ?? true,
        avatar_url: profile.avatar_url ?? '',
        created_at: profile.created_at
    };
}

function getUserDisplayName(profile) {
    return profile.full_name || `user-${profile.id?.slice(0, 6)}`;
}

function getStatusBadgeClass(active) {
    return active
        ? 'bg-[#eef5f2] text-[#1f5c57]'
        : 'bg-[#fff3ee] text-[#d66b43]';
}

function getRoleBadgeClass(role) {
    return role === 'admin'
        ? 'bg-[#eef1fb] text-[#2d3b73]'
        : 'bg-[#f3ebdf] text-[#6b6f7b]';
}

function getReportBadgeClass(status) {
    if (status === 'Selesai') return 'bg-[#eef5f2] text-[#1f5c57]';
    if (status === 'Ditinjau') return 'bg-[#eef1fb] text-[#2d3b73]';
    return 'bg-[#fff3ee] text-[#d66b43]';
}

function getOrderBadgeClass(status) {
    if (status === 'Selesai') return 'bg-[#eef5f2] text-[#1f5c57]';
    if (status === 'Diproses' || status === 'Siap Diambil') return 'bg-[#eef1fb] text-[#2d3b73]';
    if (status === 'Dibatalkan') return 'bg-[#fff3ee] text-[#b3471f]';
    return 'bg-[#fff8ef] text-[#8c5f20]';
}

function EmptyTableState({ title, text }) {
    return (
        <div className="px-6 py-12 text-center text-sm text-[#5b6170]">
            <p className="font-display text-3xl text-[#1f2333]">{title}</p>
            <p className="mx-auto mt-3 max-w-lg leading-7">{text}</p>
        </div>
    );
}

function AdminModal({ title, subtitle, children, onClose }) {
    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(31,35,51,0.44)] px-4 py-8 backdrop-blur-md">
            <div className="section-card grain-overlay max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[32px]">
                <div className="flex items-start justify-between gap-4 border-b border-[rgba(31,35,51,0.08)] px-6 py-5 sm:px-8">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">{subtitle}</p>
                        <h2 className="font-display mt-2 text-4xl text-[#1f2333]">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff3ee] text-[#d66b43]"
                        aria-label="Tutup modal"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="max-h-[calc(90vh-108px)] overflow-y-auto px-6 py-6 sm:px-8">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const { isAdmin, isAuthenticated, loading, user } = useAuth();
    const [dashboard, setDashboard] = useState({
        products: [],
        orders: [],
        reports: [],
        profiles: []
    });
    const [isFetching, setIsFetching] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [modalState, setModalState] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingTarget, setDeletingTarget] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef(null);

    const fetchDashboardData = useCallback(async () => {
        const supabase = getSupabaseBrowserClient();

        if (!supabase || !isAdmin) {
            return null;
        }

        const [productsResult, ordersResult, reportsResult, profilesResult] = await Promise.all([
            supabase
                .from('products')
                .select(`
                    id,
                    slug,
                    name,
                    short_name,
                    category,
                    description,
                    long_description,
                    serving_note,
                    image_url,
                    price,
                    accent_gradient,
                    calories_label,
                    prep_time_label,
                    freshness_label,
                    is_featured,
                    is_available,
                    sort_order
                `)
                .order('sort_order', { ascending: true }),
            supabase
                .from('orders')
                .select('id, order_code, customer_name, status, total_amount, payment_method, fulfillment_method, fulfillment_location, created_at')
                .order('created_at', { ascending: false }),
            supabase
                .from('feedback_reports')
                .select('id, report_type, message, status, created_at, profile_id')
                .order('created_at', { ascending: false }),
            supabase
                .from('profiles')
                .select('id, full_name, role, phone, avatar_url, is_active, created_at')
                .order('created_at', { ascending: false })
        ]);

        return {
            products: productsResult.data || [],
            orders: ordersResult.data || [],
            reports: reportsResult.data || [],
            profiles: profilesResult.data || []
        };
    }, [isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;

        let isMounted = true;

        const loadDashboard = async () => {
            const nextDashboard = await fetchDashboardData();
            if (!isMounted || !nextDashboard) return;

            setDashboard(nextDashboard);
            setIsFetching(false);
        };

        void loadDashboard();

        return () => {
            isMounted = false;
        };
    }, [fetchDashboardData, isAdmin]);

    const handleRefresh = async () => {
        setIsFetching(true);
        const nextDashboard = await fetchDashboardData();

        if (!nextDashboard) {
            setIsFetching(false);
            return;
        }

        setDashboard(nextDashboard);
        setIsFetching(false);
    };

    const stats = useMemo(() => ([
        {
            label: 'Produk aktif',
            value: dashboard.products.filter((product) => product.is_available).length,
            icon: Store
        },
        {
            label: 'Order masuk',
            value: dashboard.orders.length,
            icon: BarChart3
        },
        {
            label: 'Feedback baru',
            value: dashboard.reports.filter((report) => report.status === 'Baru').length,
            icon: MessageSquareQuote
        },
        {
            label: 'User terdaftar',
            value: dashboard.profiles.length,
            icon: ChefHat
        }
    ]), [dashboard.orders.length, dashboard.products, dashboard.profiles.length, dashboard.reports]);

    const openProductModal = (product = null) => {
        const nextId = dashboard.products.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
        setIsUploadingImage(false);

        setModalState({
            type: 'product',
            mode: product ? 'edit' : 'create',
            form: createProductForm(product ? product : { id: nextId, sort_order: dashboard.products.length + 1 })
        });
    };

    const openReportModal = (report) => {
        setModalState({
            type: 'report',
            form: createReportForm(report)
        });
    };

    const openProfileModal = (profile) => {
        setModalState({
            type: 'profile',
            form: createProfileForm(profile)
        });
    };

    const closeModal = () => {
        if (isSaving || isUploadingImage) return;
        setIsUploadingImage(false);
        setModalState(null);
    };

    const updateModalField = (field, value) => {
        setModalState((current) => (
            current
                ? {
                    ...current,
                    form: {
                        ...current.form,
                        [field]: value
                    }
                }
                : current
        ));
    };

    const updateOrderStatus = async (orderId, status) => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;

        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) {
            alert('Gagal memperbarui status order.');
            return;
        }

        setDashboard((current) => ({
            ...current,
            orders: current.orders.map((order) => (
                order.id === orderId ? { ...order, status } : order
            ))
        }));
    };

    const handleProductSave = async () => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase || !modalState || modalState.type !== 'product') return;

        const form = modalState.form;
        const resolvedName = form.name.trim();
        const resolvedSlug = (form.slug || slugify(resolvedName)).trim();

        if (!resolvedName || !resolvedSlug) {
            alert('Nama dan slug produk wajib diisi.');
            return;
        }

        setIsSaving(true);

        const payload = {
            id: Number(form.id),
            slug: resolvedSlug,
            name: resolvedName,
            short_name: form.short_name?.trim() || resolvedName,
            category: form.category?.trim() || 'Menu',
            description: form.description?.trim() || resolvedName,
            long_description: form.long_description?.trim() || form.description?.trim() || resolvedName,
            serving_note: form.serving_note?.trim() || 'Menu siap disajikan.',
            image_url: form.image_url?.trim() || dashboard.products.find((product) => product.id === form.id)?.image_url || '',
            price: Number(form.price) || 0,
            accent_gradient: form.accent_gradient?.trim() || 'from-[#1f5c57] via-[#2d7a72] to-[#8abfa7]',
            calories_label: form.calories_label?.trim() || '0 kkal',
            prep_time_label: form.prep_time_label?.trim() || '5 menit',
            freshness_label: form.freshness_label?.trim() || 'Diracik Saat Dipesan',
            is_featured: Boolean(form.is_featured),
            is_available: Boolean(form.is_available),
            sort_order: Number(form.sort_order) || 1
        };

        const operation = modalState.mode === 'create'
            ? supabase.from('products').insert(payload).select().single()
            : supabase.from('products').update(payload).eq('id', payload.id).select().single();

        const { data, error } = await operation;
        setIsSaving(false);

        if (error) {
            alert(`Gagal menyimpan produk: ${error.message}`);
            return;
        }

        setDashboard((current) => {
            const nextProducts = modalState.mode === 'create'
                ? [...current.products, data]
                : current.products.map((product) => (
                    product.id === data.id ? data : product
                ));

            return {
                ...current,
                products: nextProducts.sort((left, right) => left.sort_order - right.sort_order)
            };
        });
        setModalState(null);
    };

    const handleReportSave = async () => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase || !modalState || modalState.type !== 'report') return;

        setIsSaving(true);
        const { error } = await supabase
            .from('feedback_reports')
            .update({ status: modalState.form.status })
            .eq('id', modalState.form.id);
        setIsSaving(false);

        if (error) {
            alert(`Gagal memperbarui feedback: ${error.message}`);
            return;
        }

        setDashboard((current) => ({
            ...current,
            reports: current.reports.map((report) => (
                report.id === modalState.form.id
                    ? { ...report, status: modalState.form.status }
                    : report
            ))
        }));
        setModalState(null);
    };

    const handleProfileSave = async () => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase || !modalState || modalState.type !== 'profile') return;

        setIsSaving(true);
        const payload = {
            full_name: modalState.form.full_name?.trim() || null,
            phone: modalState.form.phone?.trim() || null,
            role: modalState.form.role,
            is_active: Boolean(modalState.form.is_active),
            avatar_url: modalState.form.avatar_url?.trim() || null
        };

        const { error } = await supabase
            .from('profiles')
            .update(payload)
            .eq('id', modalState.form.id);
        setIsSaving(false);

        if (error) {
            alert(`Gagal memperbarui user: ${error.message}`);
            return;
        }

        setDashboard((current) => ({
            ...current,
            profiles: current.profiles.map((profile) => (
                profile.id === modalState.form.id
                    ? { ...profile, ...payload }
                    : profile
            ))
        }));
        setModalState(null);
    };

    const handleDelete = async ({ entity, id, label }) => {
        if (!id) return;

        if (!window.confirm(`Hapus ${label} ini? Aksi ini tidak bisa dibatalkan.`)) {
            return;
        }

        setDeletingTarget({ entity, id: String(id) });

        const response = await fetch('/api/admin/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                entity,
                id
            })
        });
        const result = await response.json().catch(() => ({}));

        setDeletingTarget(null);

        if (!response.ok) {
            alert(result.error || `Gagal menghapus ${label}.`);
            return;
        }

        setDashboard((current) => {
            if (entity === 'product') {
                return {
                    ...current,
                    products: current.products.filter((product) => String(product.id) !== String(id))
                };
            }

            if (entity === 'report') {
                return {
                    ...current,
                    reports: current.reports.filter((report) => String(report.id) !== String(id))
                };
            }

            return {
                ...current,
                profiles: current.profiles.filter((profile) => String(profile.id) !== String(id))
            };
        });

        setModalState((current) => {
            if (!current?.form?.id) return current;
            return String(current.form.id) === String(id) ? null : current;
        });
    };

    const isDeletingItem = (entity, id) => (
        deletingTarget?.entity === entity && deletingTarget?.id === String(id)
    );

    const handleLocalImageUpload = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file || !modalState || modalState.type !== 'product') {
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('File yang dipilih harus berupa gambar.');
            return;
        }

        const resolvedSlug = modalState.form.slug || slugify(modalState.form.name) || `produk-${modalState.form.id}`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('slug', resolvedSlug);

        setIsUploadingImage(true);

        const response = await fetch('/api/admin/upload-product-image', {
            method: 'POST',
            body: formData
        });
        const result = await response.json().catch(() => ({}));

        setIsUploadingImage(false);

        if (!response.ok) {
            alert(result.error || 'Upload gambar gagal.');
            return;
        }

        updateModalField('image_url', result.publicUrl);
    };

    if (loading) {
        return (
            <div className="pb-8 pt-4">
                <SiteHeader />
                <main className="shell mt-6">
                    <section className="section-card rounded-[40px] p-10 text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6b6f7b]">Mengecek akses admin...</p>
                    </section>
                </main>
                <SiteFooter />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="pb-8 pt-4">
                <SiteHeader />
                <main className="shell mt-6">
                    <section className="section-card rounded-[40px] p-10 text-center">
                        <h1 className="font-display text-5xl text-[#1f2333]">Admin butuh akun yang login.</h1>
                        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#5b6170]">
                            Masuk dulu dengan akun Supabase, lalu beri role `admin` pada tabel `profiles` untuk membuka dashboard ini.
                        </p>
                        <Link href="/auth" className="mt-8 inline-flex rounded-full bg-[#1f2333] px-6 py-3 text-sm font-semibold text-white">
                            Buka Halaman Login
                        </Link>
                    </section>
                </main>
                <SiteFooter />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="pb-8 pt-4">
                <SiteHeader />
                <main className="shell mt-6">
                    <section className="section-card rounded-[40px] p-10 text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#fff3ee] text-[#d66b43]">
                            <ShieldAlert size={42} />
                        </div>
                        <h1 className="font-display mt-6 text-5xl text-[#1f2333]">Role admin belum aktif.</h1>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#5b6170]">
                            Untuk presentasi, buka tabel `profiles` di Supabase lalu ubah kolom `role` akunmu menjadi `admin`. Setelah itu refresh halaman ini.
                        </p>
                    </section>
                </main>
                <SiteFooter />
            </div>
        );
    }

    const renderActiveTable = () => {
        if (activeTab === 'products') {
            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="text-left text-[11px] font-bold uppercase tracking-[0.26em] text-[#6b6f7b]">
                                <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4">Produk</th>
                                <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4">Harga</th>
                                <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4">Urutan</th>
                                <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4">Status</th>
                                <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboard.products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-0">
                                        <EmptyTableState title="Produk belum ada." text="Tambahkan produk pertama langsung dari modal sederhana di panel admin ini." />
                                    </td>
                                </tr>
                            ) : dashboard.products.map((product) => (
                                <tr key={product.id} className="align-top">
                                    <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5">
                                        <p className="font-semibold text-[#1f2333]">{product.name}</p>
                                        <p className="mt-1 text-sm text-[#5b6170]">{product.category} • {product.slug}</p>
                                    </td>
                                    <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5 font-semibold text-[#d66b43]">
                                        Rp {formatCurrency(product.price)}
                                    </td>
                                    <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5 text-sm text-[#5b6170]">
                                        #{product.sort_order}
                                    </td>
                                    <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5">
                                        <button
                                            onClick={() => openProductModal(product)}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadgeClass(product.is_available)}`}
                                        >
                                            {product.is_available ? 'Aktif' : 'Nonaktif'}
                                        </button>
                                    </td>
                                    <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5 text-right">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <button
                                                onClick={() => openProductModal(product)}
                                                className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,35,51,0.08)] bg-white px-4 py-2 text-sm font-semibold text-[#1f2333]"
                                            >
                                                <PencilLine size={15} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => void handleDelete({ entity: 'product', id: product.id, label: `produk ${product.name}` })}
                                                disabled={isDeletingItem('product', product.id)}
                                                className="inline-flex items-center gap-2 rounded-full border border-[rgba(214,107,67,0.22)] bg-[#fff3ee] px-4 py-2 text-sm font-semibold text-[#d66b43] disabled:opacity-60"
                                            >
                                                <Trash2 size={15} />
                                                {isDeletingItem('product', product.id) ? 'Menghapus...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (activeTab === 'reports') {
            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="text-left text-[11px] font-bold uppercase tracking-[0.26em] text-[#6b6f7b]">
                                <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4">Feedback</th>
                                <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4">Tanggal</th>
                                <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4">Status</th>
                                <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboard.reports.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-0">
                                        <EmptyTableState title="Belum ada feedback." text="Masukan pelanggan akan muncul di sini supaya admin bisa menindaklanjuti satu per satu." />
                                    </td>
                                </tr>
                            ) : dashboard.reports.map((report) => (
                                <tr key={report.id} className="align-top">
                                    <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5">
                                        <p className="font-semibold uppercase tracking-[0.18em] text-[#6b6f7b]">{report.report_type}</p>
                                        <p className="mt-2 max-w-xl text-sm leading-7 text-[#1f2333]">
                                            {report.message.length > 100 ? `${report.message.slice(0, 100)}...` : report.message}
                                        </p>
                                    </td>
                                    <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5 text-sm text-[#5b6170]">
                                        {formatOrderDate(report.created_at)}
                                    </td>
                                    <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5">
                                        <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getReportBadgeClass(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5 text-right">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <button
                                                onClick={() => openReportModal(report)}
                                                className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,35,51,0.08)] bg-white px-4 py-2 text-sm font-semibold text-[#1f2333]"
                                            >
                                                <Eye size={15} />
                                                Kelola
                                            </button>
                                            <button
                                                onClick={() => void handleDelete({ entity: 'report', id: report.id, label: 'feedback' })}
                                                disabled={isDeletingItem('report', report.id)}
                                                className="inline-flex items-center gap-2 rounded-full border border-[rgba(214,107,67,0.22)] bg-[#fff3ee] px-4 py-2 text-sm font-semibold text-[#d66b43] disabled:opacity-60"
                                            >
                                                <Trash2 size={15} />
                                                {isDeletingItem('report', report.id) ? 'Menghapus...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                        <tr className="text-left text-[11px] font-bold uppercase tracking-[0.26em] text-[#6b6f7b]">
                            <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4">User</th>
                            <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4">Role</th>
                            <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4">Kontak</th>
                            <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4">Status</th>
                            <th className="border-b border-[rgba(31,35,51,0.08)] px-5 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboard.profiles.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-0">
                                    <EmptyTableState title="Belum ada user." text="User yang register lewat Supabase akan otomatis muncul di sini melalui tabel profiles." />
                                </td>
                            </tr>
                        ) : dashboard.profiles.map((profile) => (
                            <tr key={profile.id} className="align-top">
                                <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5">
                                    <p className="font-semibold text-[#1f2333]">{getUserDisplayName(profile)}</p>
                                    <p className="mt-1 text-sm text-[#5b6170]">{profile.id.slice(0, 8)}...</p>
                                </td>
                                <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5">
                                    <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getRoleBadgeClass(profile.role)}`}>
                                        {profile.role}
                                    </span>
                                </td>
                                <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5 text-sm text-[#5b6170]">
                                    {profile.phone || 'Belum diisi'}
                                </td>
                                <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5">
                                    <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadgeClass(profile.is_active)}`}>
                                        {profile.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td className="border-b border-[rgba(31,35,51,0.08)] px-5 py-5 text-right">
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <button
                                            onClick={() => openProfileModal(profile)}
                                            className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,35,51,0.08)] bg-white px-4 py-2 text-sm font-semibold text-[#1f2333]"
                                        >
                                            <PencilLine size={15} />
                                            Kelola
                                        </button>
                                        <button
                                            onClick={() => void handleDelete({ entity: 'profile', id: profile.id, label: `user ${getUserDisplayName(profile)}` })}
                                            disabled={profile.id === user?.id || isDeletingItem('profile', profile.id)}
                                            className="inline-flex items-center gap-2 rounded-full border border-[rgba(214,107,67,0.22)] bg-[#fff3ee] px-4 py-2 text-sm font-semibold text-[#d66b43] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <Trash2 size={15} />
                                            {profile.id === user?.id ? 'Akun Aktif' : isDeletingItem('profile', profile.id) ? 'Menghapus...' : 'Delete'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="pb-8 pt-4">
            <SiteHeader />

            <main className="shell mt-6 space-y-6">
                <section className="section-card grain-overlay overflow-hidden rounded-[40px] px-6 py-8 sm:px-10">
                    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                        <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Admin control desk</p>
                            <h1 className="font-display max-w-4xl text-4xl text-[#1f2333] sm:text-6xl">
                                Kelola produk, feedback, dan user dari satu meja operasi.
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5b6170]">
                                Saya rombak area admin jadi lebih cocok untuk demo operasional: ada antrian order, data studio berbasis tabel, dan modal edit cepat supaya tidak terasa polos.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
                            <button
                                onClick={() => void handleRefresh()}
                                className="inline-flex items-center gap-2 rounded-full border border-[rgba(31,35,51,0.08)] bg-white px-5 py-3 text-sm font-semibold text-[#1f2333] hover:bg-[#f4ebdf]"
                            >
                                <RefreshCcw size={16} />
                                {isFetching ? 'Menyegarkan...' : 'Refresh Data'}
                            </button>
                            <button
                                onClick={() => openProductModal()}
                                className="inline-flex items-center gap-2 rounded-full bg-[#1f2333] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(31,35,51,0.18)]"
                            >
                                <Plus size={16} />
                                Tambah Produk
                            </button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <article key={stat.label} className="section-card rounded-[30px] p-6">
                            <div className="mb-5 inline-flex rounded-2xl bg-[#f3ebdf] p-3 text-[#d66b43]">
                                <stat.icon size={20} />
                            </div>
                            <p className="font-display text-5xl text-[#1f2333]">{stat.value}</p>
                            <p className="mt-3 text-xs font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">{stat.label}</p>
                        </article>
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                    <article className="section-card rounded-[34px] p-6 sm:p-8">
                        <div className="mb-6 flex items-end justify-between gap-4 border-b border-[rgba(31,35,51,0.08)] pb-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Antrian pesanan</p>
                                <h2 className="font-display mt-2 text-4xl text-[#1f2333]">Order queue untuk kasir.</h2>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border-separate border-spacing-0">
                                <thead>
                                    <tr className="text-left text-[11px] font-bold uppercase tracking-[0.26em] text-[#6b6f7b]">
                                        <th className="border-b border-[rgba(31,35,51,0.08)] px-4 py-3">Kode</th>
                                        <th className="border-b border-[rgba(31,35,51,0.08)] px-4 py-3">Pelanggan</th>
                                        <th className="border-b border-[rgba(31,35,51,0.08)] px-4 py-3">Total</th>
                                        <th className="border-b border-[rgba(31,35,51,0.08)] px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboard.orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-0">
                                                <EmptyTableState title="Belum ada order." text="Begitu checkout atau data demo masuk, antrian order akan tampil di panel ini." />
                                            </td>
                                        </tr>
                                    ) : dashboard.orders.slice(0, 8).map((order) => (
                                        <tr key={order.id}>
                                            <td className="border-b border-[rgba(31,35,51,0.08)] px-4 py-4">
                                                <p className="font-display text-2xl text-[#1f2333]">{order.order_code}</p>
                                                <p className="mt-1 text-sm text-[#5b6170]">{formatOrderDate(order.created_at)}</p>
                                            </td>
                                            <td className="border-b border-[rgba(31,35,51,0.08)] px-4 py-4 text-sm text-[#5b6170]">
                                                <p className="font-semibold text-[#1f2333]">{order.customer_name}</p>
                                                <p>{order.fulfillment_method === 'delivery' ? order.fulfillment_location : 'Ambil di kantin'}</p>
                                                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#6b6f7b]">
                                                    {formatPaymentMethodLabel(order.payment_method)}
                                                </p>
                                            </td>
                                            <td className="border-b border-[rgba(31,35,51,0.08)] px-4 py-4 font-semibold text-[#d66b43]">
                                                Rp {formatCurrency(order.total_amount)}
                                            </td>
                                            <td className="border-b border-[rgba(31,35,51,0.08)] px-4 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(event) => void updateOrderStatus(order.id, event.target.value)}
                                                    className={`rounded-full border border-[rgba(31,35,51,0.08)] px-4 py-2 text-sm font-semibold ${getOrderBadgeClass(order.status)}`}
                                                >
                                                    {orderStatuses.map((status) => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="section-card rounded-[34px] p-6 sm:p-8">
                        <div className="flex flex-col gap-5 border-b border-[rgba(31,35,51,0.08)] pb-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#6b6f7b]">Data studio</p>
                                <h2 className="font-display mt-2 text-4xl text-[#1f2333]">Kelola data dengan tabel dan modal.</h2>
                            </div>
                            <div className="grid w-full max-w-xl grid-cols-3 gap-1 rounded-[28px] bg-[#f3ebdf] p-1.5">
                                {tableTabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[22px] px-3 py-3 text-center text-sm font-semibold whitespace-nowrap ${activeTab === tab.key ? 'bg-[#1f2333] text-white shadow-[0_12px_24px_rgba(31,35,51,0.18)]' : 'text-[#1f2333]'}`}
                                    >
                                        <tab.icon size={15} className="shrink-0" />
                                        <span className="truncate">{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 overflow-hidden rounded-[28px] border border-[rgba(31,35,51,0.08)] bg-white/65">
                            {renderActiveTable()}
                        </div>
                    </article>
                </section>
            </main>

            {modalState?.type === 'product' && (
                <AdminModal
                    title={modalState.mode === 'create' ? 'Tambah produk baru' : 'Edit produk'}
                    subtitle={modalState.mode === 'create' ? 'Produk' : 'Produk aktif'}
                    onClose={closeModal}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Nama produk
                            <input
                                value={modalState.form.name}
                                onChange={(event) => updateModalField('name', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Slug
                            <input
                                value={modalState.form.slug}
                                onChange={(event) => updateModalField('slug', slugify(event.target.value))}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Short name
                            <input
                                value={modalState.form.short_name}
                                onChange={(event) => updateModalField('short_name', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Kategori
                            <input
                                value={modalState.form.category}
                                onChange={(event) => updateModalField('category', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Harga
                            <input
                                type="number"
                                value={modalState.form.price}
                                onChange={(event) => updateModalField('price', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Urutan
                            <input
                                type="number"
                                value={modalState.form.sort_order}
                                onChange={(event) => updateModalField('sort_order', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                    </div>

                    <div className="mt-4 grid gap-4">
                        <div className="rounded-[28px] border border-dashed border-[rgba(31,35,51,0.12)] bg-[#fffaf2] p-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-[#1f2333]">Upload foto dari perangkat</p>
                                    <p className="mt-1 text-sm leading-7 text-[#5b6170]">
                                        Pilih gambar lokal, lalu sistem akan upload ke Supabase Storage dan mengisi URL gambar otomatis.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLocalImageUpload}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingImage}
                                        className="inline-flex items-center gap-2 rounded-full bg-[#1f5c57] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                                    >
                                        <Upload size={15} />
                                        {isUploadingImage ? 'Mengupload...' : 'Upload Foto Lokal'}
                                    </button>
                                </div>
                            </div>

                            {modalState.form.image_url && (
                                <div className="mt-4 grid gap-4 lg:grid-cols-[180px_1fr] lg:items-center">
                                    <div className="relative aspect-square overflow-hidden rounded-[24px] border border-[rgba(31,35,51,0.08)] bg-white">
                                        <Image
                                            src={modalState.form.image_url}
                                            alt={modalState.form.name || 'Preview produk'}
                                            fill
                                            sizes="180px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="rounded-[24px] bg-white p-4 text-sm text-[#5b6170]">
                                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">Preview gambar aktif</p>
                                        <p className="mt-2 break-all leading-7">{modalState.form.image_url}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            URL gambar
                            <input
                                value={modalState.form.image_url}
                                onChange={(event) => updateModalField('image_url', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Deskripsi singkat
                            <textarea
                                rows={3}
                                value={modalState.form.description}
                                onChange={(event) => updateModalField('description', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Deskripsi panjang
                            <textarea
                                rows={4}
                                value={modalState.form.long_description}
                                onChange={(event) => updateModalField('long_description', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Serving note
                            <input
                                value={modalState.form.serving_note}
                                onChange={(event) => updateModalField('serving_note', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Label kalori
                            <input
                                value={modalState.form.calories_label}
                                onChange={(event) => updateModalField('calories_label', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Waktu siap
                            <input
                                value={modalState.form.prep_time_label}
                                onChange={(event) => updateModalField('prep_time_label', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Karakter sajian
                            <input
                                value={modalState.form.freshness_label}
                                onChange={(event) => updateModalField('freshness_label', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Accent gradient
                            <input
                                value={modalState.form.accent_gradient}
                                onChange={(event) => updateModalField('accent_gradient', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <button
                            onClick={() => updateModalField('is_featured', !modalState.form.is_featured)}
                            className={`rounded-[22px] px-4 py-4 text-left text-sm font-semibold ${modalState.form.is_featured ? 'bg-[#eef1fb] text-[#2d3b73]' : 'bg-[#fffaf2] text-[#5b6170]'}`}
                        >
                            Feature hero: {modalState.form.is_featured ? 'Ya' : 'Tidak'}
                        </button>
                        <button
                            onClick={() => updateModalField('is_available', !modalState.form.is_available)}
                            className={`rounded-[22px] px-4 py-4 text-left text-sm font-semibold ${modalState.form.is_available ? 'bg-[#eef5f2] text-[#1f5c57]' : 'bg-[#fff3ee] text-[#d66b43]'}`}
                        >
                            Status jual: {modalState.form.is_available ? 'Aktif' : 'Nonaktif'}
                        </button>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-end gap-3">
                        {modalState.mode === 'edit' && (
                            <button
                                onClick={() => void handleDelete({ entity: 'product', id: modalState.form.id, label: `produk ${modalState.form.name || 'ini'}` })}
                                disabled={isSaving || isDeletingItem('product', modalState.form.id)}
                                className="rounded-full border border-[rgba(214,107,67,0.22)] bg-[#fff3ee] px-5 py-3 text-sm font-semibold text-[#d66b43] disabled:opacity-60"
                            >
                                {isDeletingItem('product', modalState.form.id) ? 'Menghapus...' : 'Delete Produk'}
                            </button>
                        )}
                        <button
                            onClick={closeModal}
                            className="rounded-full border border-[rgba(31,35,51,0.08)] bg-white px-5 py-3 text-sm font-semibold text-[#1f2333]"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => void handleProductSave()}
                            disabled={isSaving || isUploadingImage}
                            className="rounded-full bg-[#1f2333] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {isSaving ? 'Menyimpan...' : isUploadingImage ? 'Menunggu Upload...' : 'Simpan Produk'}
                        </button>
                    </div>
                </AdminModal>
            )}

            {modalState?.type === 'report' && (
                <AdminModal title="Kelola feedback" subtitle="Feedback pelanggan" onClose={closeModal}>
                    <div className="space-y-5">
                        <div className="rounded-[24px] bg-[#fffaf2] p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">Jenis feedback</p>
                            <p className="mt-2 font-semibold text-[#1f2333]">{modalState.form.report_type}</p>
                        </div>
                        <div className="rounded-[24px] bg-[#fffaf2] p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">Pesan lengkap</p>
                            <p className="mt-2 text-sm leading-8 text-[#1f2333]">{modalState.form.message}</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[24px] bg-[#fffaf2] p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">Masuk pada</p>
                                <p className="mt-2 font-semibold text-[#1f2333]">{formatOrderDate(modalState.form.created_at)}</p>
                            </div>
                            <label className="rounded-[24px] bg-[#fffaf2] p-5 text-sm font-semibold text-[#1f2333]">
                                Status feedback
                                <select
                                    value={modalState.form.status}
                                    onChange={(event) => updateModalField('status', event.target.value)}
                                    className="mt-3 w-full rounded-[18px] border border-[rgba(31,35,51,0.08)] bg-white px-4 py-3 text-sm"
                                >
                                    {reportStatuses.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-end gap-3">
                        <button
                            onClick={() => void handleDelete({ entity: 'report', id: modalState.form.id, label: 'feedback ini' })}
                            disabled={isSaving || isDeletingItem('report', modalState.form.id)}
                            className="rounded-full border border-[rgba(214,107,67,0.22)] bg-[#fff3ee] px-5 py-3 text-sm font-semibold text-[#d66b43] disabled:opacity-60"
                        >
                            {isDeletingItem('report', modalState.form.id) ? 'Menghapus...' : 'Delete Feedback'}
                        </button>
                        <button
                            onClick={closeModal}
                            className="rounded-full border border-[rgba(31,35,51,0.08)] bg-white px-5 py-3 text-sm font-semibold text-[#1f2333]"
                        >
                            Tutup
                        </button>
                        <button
                            onClick={() => void handleReportSave()}
                            disabled={isSaving}
                            className="rounded-full bg-[#1f2333] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan Status'}
                        </button>
                    </div>
                </AdminModal>
            )}

            {modalState?.type === 'profile' && (
                <AdminModal title="Kelola user" subtitle="Akses pengguna" onClose={closeModal}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Nama lengkap
                            <input
                                value={modalState.form.full_name}
                                onChange={(event) => updateModalField('full_name', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Nomor telepon
                            <input
                                value={modalState.form.phone}
                                onChange={(event) => updateModalField('phone', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Role
                            <select
                                value={modalState.form.role}
                                onChange={(event) => updateModalField('role', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            >
                                {profileRoles.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </label>
                        <label className="text-sm font-semibold text-[#1f2333]">
                            Avatar URL
                            <input
                                value={modalState.form.avatar_url}
                                onChange={(event) => updateModalField('avatar_url', event.target.value)}
                                className="mt-2 w-full rounded-[20px] border border-[rgba(31,35,51,0.08)] bg-[#fffaf2] px-4 py-3 text-sm"
                            />
                        </label>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[24px] bg-[#fffaf2] p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6b6f7b]">User ID</p>
                            <p className="mt-2 break-all text-sm text-[#1f2333]">{modalState.form.id}</p>
                        </div>
                        <button
                            onClick={() => updateModalField('is_active', !modalState.form.is_active)}
                            className={`rounded-[24px] p-5 text-left text-sm font-semibold ${modalState.form.is_active ? 'bg-[#eef5f2] text-[#1f5c57]' : 'bg-[#fff3ee] text-[#d66b43]'}`}
                        >
                            Status akun: {modalState.form.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-end gap-3">
                        <button
                            onClick={() => void handleDelete({ entity: 'profile', id: modalState.form.id, label: `user ${modalState.form.full_name || 'ini'}` })}
                            disabled={modalState.form.id === user?.id || isSaving || isDeletingItem('profile', modalState.form.id)}
                            className="rounded-full border border-[rgba(214,107,67,0.22)] bg-[#fff3ee] px-5 py-3 text-sm font-semibold text-[#d66b43] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {modalState.form.id === user?.id ? 'Akun Aktif' : isDeletingItem('profile', modalState.form.id) ? 'Menghapus...' : 'Delete User'}
                        </button>
                        <button
                            onClick={closeModal}
                            className="rounded-full border border-[rgba(31,35,51,0.08)] bg-white px-5 py-3 text-sm font-semibold text-[#1f2333]"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => void handleProfileSave()}
                            disabled={isSaving}
                            className="rounded-full bg-[#1f2333] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan User'}
                        </button>
                    </div>
                </AdminModal>
            )}

            <SiteFooter />
        </div>
    );
}
