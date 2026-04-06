import { NextResponse } from 'next/server';
import { syncMidtransOrder } from '../../../../../lib/midtrans/orderSync';

export async function POST(request) {
    try {
        const body = await request.json();
        const result = await syncMidtransOrder(body.orderId);

        return NextResponse.json({
            synced: true,
            order: result.order,
            transaction: {
                status: result.transaction.transaction_status,
                paymentType: result.transaction.payment_type,
                transactionId: result.transaction.transaction_id
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message || 'Gagal sinkronisasi order Midtrans.' },
            { status: 500 }
        );
    }
}
