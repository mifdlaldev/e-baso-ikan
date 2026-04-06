export function formatCurrency(amount) {
    const numericAmount = Number(amount) || 0;
    return new Intl.NumberFormat('id-ID').format(numericAmount);
}

export function formatOrderDate(value) {
    if (!value) return 'Baru saja';

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return value;

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(parsedDate);
}

export function formatPaymentMethodLabel(value) {
    switch (value) {
        case 'midtrans':
            return 'Midtrans';
        case 'saldo':
            return 'Saldo Siswa';
        case 'tunai':
            return 'Tunai';
        case 'qris':
            return 'QRIS';
        default:
            return value || 'Belum dipilih';
    }
}

export function resolvePaymentMethodLabel(order = {}) {
    if (order.paymentProvider === 'midtrans' || order.paymentMethod === 'midtrans') {
        return 'Midtrans';
    }

    if (order.paymentMethod === 'tunai') {
        return 'Tunai';
    }

    return formatPaymentMethodLabel(order.paymentMethod);
}

export function formatPaymentStatusLabel(value) {
    switch (value) {
        case 'paid':
            return 'Lunas';
        case 'pending':
            return 'Menunggu bayar';
        case 'challenge':
            return 'Perlu review';
        case 'manual':
            return 'Manual';
        case 'initiated':
            return 'Dibuat';
        case 'authorized':
            return 'Terotorisasi';
        case 'cancel':
            return 'Dibatalkan';
        case 'expire':
            return 'Kedaluwarsa';
        case 'deny':
            return 'Ditolak';
        case 'failure':
            return 'Gagal';
        case 'refund':
            return 'Refund';
        case 'partial_refund':
            return 'Refund parsial';
        case 'chargeback':
            return 'Chargeback';
        default:
            return value || 'Belum ada status';
    }
}
