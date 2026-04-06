import { NextResponse } from 'next/server';
import { assertMidtransServerEnv } from '../../../../../lib/midtrans/env';
import { createMidtransSnapTransaction } from '../../../../../lib/midtrans/server';

function buildMidtransItemDetails({ items = [], serviceFee = 0 }) {
    const mappedItems = items.map((item) => ({
        id: String(item.id || item.product_id || item.name),
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        name: item.name || 'Menu e-baso-ikan'
    }));

    if (serviceFee > 0) {
        mappedItems.push({
            id: 'service-fee',
            price: Number(serviceFee),
            quantity: 1,
            name: 'Biaya layanan'
        });
    }

    return mappedItems;
}

export async function POST(request) {
    try {
        assertMidtransServerEnv();
        const body = await request.json();

        const orderId = String(body.orderId || '')
            .trim()
            .replace(/[^A-Za-z0-9-_.]/g, '-');
        const grossAmount = Number(body.total || 0);
        const customerName = String(body.customerName || '').trim();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID wajib ada sebelum membuat token Midtrans.' }, { status: 400 });
        }

        if (!grossAmount || grossAmount < 1) {
            return NextResponse.json({ error: 'Total pembayaran Midtrans tidak valid.' }, { status: 400 });
        }

        if (!customerName) {
            return NextResponse.json({ error: 'Nama pelanggan wajib diisi.' }, { status: 400 });
        }

        const payload = {
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount
            },
            callbacks: {
                finish: `${request.nextUrl.origin}/checkout/success?order_id=${encodeURIComponent(orderId)}`
            },
            credit_card: {
                secure: true
            },
            gopay: {
                enable_callback: true,
                callback_url: `${request.nextUrl.origin}/checkout/success?order_id=${encodeURIComponent(orderId)}`
            },
            item_details: buildMidtransItemDetails({
                items: Array.isArray(body.items) ? body.items : [],
                serviceFee: Number(body.serviceFee || 0)
            }),
            customer_details: {
                first_name: customerName,
                email: body.customerEmail || undefined,
                phone: body.customerPhone || undefined
            },
            custom_field1: body.deliveryMethod || undefined,
            custom_field2: body.destination || undefined,
            custom_field3: body.orderNote || undefined
        };

        const result = await createMidtransSnapTransaction(payload);

        return NextResponse.json({
            token: result.token,
            redirectUrl: result.redirect_url || null
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message || 'Terjadi kesalahan saat menghubungi Midtrans.' },
            { status: 500 }
        );
    }
}
