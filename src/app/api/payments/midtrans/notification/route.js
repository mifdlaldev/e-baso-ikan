import { NextResponse } from 'next/server';
import { syncMidtransOrder } from '../../../../../lib/midtrans/orderSync';
import { verifyMidtransSignature } from '../../../../../lib/midtrans/server';

export async function POST(request) {
    try {
        const payload = await request.json();

        if (!verifyMidtransSignature(payload)) {
            return NextResponse.json({ error: 'Signature Midtrans tidak valid.' }, { status: 403 });
        }

        const result = await syncMidtransOrder(payload.order_id);

        return NextResponse.json({
            received: true,
            synced: true,
            order: result.order
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message || 'Gagal memproses notifikasi Midtrans.' },
            { status: 500 }
        );
    }
}
