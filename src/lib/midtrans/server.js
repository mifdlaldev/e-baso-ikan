import crypto from 'node:crypto';
import { assertMidtransServerEnv, getMidtransCoreApiBaseUrl, getMidtransSnapApiUrl } from './env';

function getMidtransAuthHeader(serverKey) {
    return `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;
}

export function buildMidtransSignature(orderId, statusCode, grossAmount, serverKey) {
    return crypto
        .createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest('hex');
}

export function verifyMidtransSignature(payload) {
    const { serverKey } = assertMidtransServerEnv();
    const expectedSignature = buildMidtransSignature(
        String(payload.order_id || ''),
        String(payload.status_code || ''),
        String(payload.gross_amount || ''),
        serverKey
    );

    return expectedSignature === payload.signature_key;
}

export async function fetchMidtransTransactionStatus(orderId) {
    const { serverKey } = assertMidtransServerEnv();
    const response = await fetch(`${getMidtransCoreApiBaseUrl()}/${encodeURIComponent(orderId)}/status`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: getMidtransAuthHeader(serverKey)
        },
        cache: 'no-store'
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result) {
        throw new Error(result?.status_message || 'Gagal mengambil status transaksi Midtrans.');
    }

    return result;
}

export async function createMidtransSnapTransaction(payload) {
    const { serverKey } = assertMidtransServerEnv();
    const response = await fetch(getMidtransSnapApiUrl(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: getMidtransAuthHeader(serverKey)
        },
        body: JSON.stringify(payload),
        cache: 'no-store'
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.token) {
        throw new Error(result?.error_messages?.join(', ') || result?.status_message || 'Gagal membuat Snap token Midtrans.');
    }

    return result;
}

export function mapMidtransTransactionToOrderState(transaction = {}) {
    const transactionStatus = String(transaction.transaction_status || '').toLowerCase();
    const fraudStatus = String(transaction.fraud_status || '').toLowerCase();
    const paymentType = transaction.payment_type || 'midtrans';

    if (transactionStatus === 'settlement') {
        return {
            paymentMethod: 'midtrans',
            paymentProvider: paymentType,
            paymentStatus: 'paid',
            orderStatus: 'Diproses',
            paidAt: transaction.settlement_time || transaction.transaction_time || null
        };
    }

    if (transactionStatus === 'capture') {
        if (fraudStatus === 'challenge') {
            return {
                paymentMethod: 'midtrans',
                paymentProvider: paymentType,
                paymentStatus: 'challenge',
                orderStatus: 'Menunggu',
                paidAt: null
            };
        }

        return {
            paymentMethod: 'midtrans',
            paymentProvider: paymentType,
            paymentStatus: 'paid',
            orderStatus: 'Diproses',
            paidAt: transaction.settlement_time || transaction.transaction_time || null
        };
    }

    if (transactionStatus === 'pending') {
        return {
            paymentMethod: 'midtrans',
            paymentProvider: paymentType,
            paymentStatus: 'pending',
            orderStatus: 'Menunggu',
            paidAt: null
        };
    }

    if (transactionStatus === 'authorize') {
        return {
            paymentMethod: 'midtrans',
            paymentProvider: paymentType,
            paymentStatus: 'authorized',
            orderStatus: 'Menunggu',
            paidAt: transaction.transaction_time || null
        };
    }

    if (['deny', 'cancel', 'expire', 'failure', 'refund', 'partial_refund', 'chargeback'].includes(transactionStatus)) {
        return {
            paymentMethod: 'midtrans',
            paymentProvider: paymentType,
            paymentStatus: transactionStatus,
            orderStatus: 'Dibatalkan',
            paidAt: null
        };
    }

    return {
        paymentMethod: 'midtrans',
        paymentProvider: paymentType,
        paymentStatus: transactionStatus || 'unknown',
        orderStatus: 'Menunggu',
        paidAt: null
    };
}
