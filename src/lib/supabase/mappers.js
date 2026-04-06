import { MENU_PRODUCTS } from '../productCatalog';
import { getProductImage } from '../productImages';

const catalogById = new Map(MENU_PRODUCTS.map((product) => [product.id, product]));

export function mapDbProductToApp(productRow) {
    const fallback = catalogById.get(productRow.id) || {};

    return {
        ...fallback,
        id: productRow.id,
        slug: productRow.slug,
        name: productRow.name,
        shortName: productRow.short_name,
        description: productRow.description,
        longDescription: productRow.long_description,
        price: productRow.price,
        category: productRow.category,
        image: productRow.image_url,
        popular: productRow.is_featured,
        available: productRow.is_available,
        accent: productRow.accent_gradient || fallback.accent,
        calories: productRow.calories_label,
        prepTime: productRow.prep_time_label,
        freshness: productRow.freshness_label,
        servingNote: productRow.serving_note,
        sortOrder: productRow.sort_order,
        addons: (productRow.product_addons || [])
            .filter((addon) => addon.is_active)
            .sort((left, right) => left.sort_order - right.sort_order)
            .map((addon) => ({
                key: addon.code,
                label: addon.label,
                price: addon.price
            }))
    };
}

export function buildOrderInsertPayload({ cartItems, metadata = {} }) {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const serviceFee = cartItems.length > 0 ? 2000 : 0;

    return {
        order: {
            profile_id: metadata.profileId || null,
            customer_name: metadata.nama_pembeli || metadata.customer_name || 'Pelanggan',
            customer_note: metadata.note || null,
            payment_method: metadata.paymentMethod || 'saldo',
            fulfillment_method: metadata.deliveryMethod || 'pickup',
            fulfillment_location: metadata.classRoom || null,
            status: 'Menunggu',
            item_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal_amount: subtotal,
            service_fee: serviceFee,
            total_amount: subtotal + serviceFee,
            source_channel: 'web'
        },
        items: cartItems.map((item) => ({
            product_id: item.id,
            product_name: item.name,
            product_slug: item.slug || null,
            unit_price: item.price,
            quantity: item.quantity,
            addons: Array.isArray(item.extras) ? item.extras : [],
            note: item.note || null,
            line_total: item.price * item.quantity
        }))
    };
}

export function mapReportInsertPayload(report) {
    return {
        profile_id: report.profile_id || null,
        report_type: report.type || 'Saran',
        message: report.message,
        status: report.status || 'Baru'
    };
}

export function mapDbOrderToApp(orderRow) {
    return {
        id: orderRow.order_code,
        date: orderRow.created_at,
        total: orderRow.total_amount,
        status: orderRow.status,
        paymentMethod: orderRow.payment_method,
        paymentProvider: orderRow.payment_provider,
        paymentStatus: orderRow.payment_status,
        paymentReference: orderRow.payment_reference,
        paidAt: orderRow.paid_at,
        deliveryMethod: orderRow.fulfillment_method,
        classRoom: orderRow.fulfillment_location,
        note: orderRow.customer_note,
        nama_pembeli: orderRow.customer_name,
        items: (orderRow.order_items || []).map((item) => ({
            id: item.product_id || item.id,
            product_id: item.product_id,
            slug: item.product_slug,
            name: item.product_name,
            image: getProductImage({
                id: item.product_id,
                name: item.product_name
            }),
            price: item.unit_price,
            quantity: item.quantity,
            extras: Array.isArray(item.addons) ? item.addons : []
        }))
    };
}
