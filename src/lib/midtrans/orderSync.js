import { getSupabaseAdminClient } from '../supabase/admin';
import { fetchMidtransTransactionStatus, mapMidtransTransactionToOrderState } from './server';

export async function syncMidtransOrder(orderId) {
    const trimmedOrderId = String(orderId || '').trim();

    if (!trimmedOrderId) {
        throw new Error('Order ID Midtrans wajib diisi.');
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
        throw new Error('Supabase admin belum siap untuk sinkronisasi Midtrans.');
    }

    const transaction = await fetchMidtransTransactionStatus(trimmedOrderId);
    const resolved = mapMidtransTransactionToOrderState(transaction);

    const updatePayload = {
        status: resolved.orderStatus,
        payment_method: resolved.paymentMethod,
        payment_provider: resolved.paymentProvider,
        payment_status: resolved.paymentStatus,
        payment_reference: transaction.transaction_id || null,
        payment_payload: transaction,
        paid_at: resolved.paidAt
    };

    let data = null;
    let error = null;

    const attemptUpdate = async (payload, selectColumns) => supabase
        .from('orders')
        .update(payload)
        .eq('order_code', trimmedOrderId)
        .select(selectColumns)
        .maybeSingle();

    const primaryResult = await attemptUpdate(
        updatePayload,
        'id, order_code, status, payment_method, payment_provider, payment_status, payment_reference, paid_at'
    );

    data = primaryResult.data;
    error = primaryResult.error;

    if (error && /invalid input value for enum payment_method/i.test(error.message || '')) {
        const enumFallbackResult = await attemptUpdate(
            {
                ...updatePayload,
                payment_method: 'tunai'
            },
            'id, order_code, status, payment_method, payment_provider, payment_status, payment_reference, paid_at'
        );

        data = enumFallbackResult.data;
        error = enumFallbackResult.error;
    }

    if (error && /column .* does not exist/i.test(error.message || '')) {
        const reducedPayload = /invalid input value for enum payment_method/i.test(error.message || '')
            ? { status: resolved.orderStatus, payment_method: 'tunai' }
            : { status: resolved.orderStatus, payment_method: resolved.paymentMethod };

        const fallbackResult = await attemptUpdate(
            reducedPayload,
            'id, order_code, status, payment_method'
        );

        data = fallbackResult.data;
        error = fallbackResult.error;
    }

    if (error && /invalid input value for enum payment_method/i.test(error.message || '')) {
        const minimalFallbackResult = await attemptUpdate(
            { status: resolved.orderStatus },
            'id, order_code, status, payment_method'
        );

        data = minimalFallbackResult.data;
        error = minimalFallbackResult.error;
    }

    if (error) {
        throw new Error(`Gagal memperbarui order dari notifikasi Midtrans: ${error.message}`);
    }

    if (!data) {
        throw new Error(`Order ${trimmedOrderId} tidak ditemukan di database.`);
    }

    return {
        order: data,
        transaction
    };
}
