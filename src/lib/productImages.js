const PRODUCT_IMAGE_MAP = {
    1: 'https://images.unsplash.com/photo-1537081538824-2fcad5cb096b?auto=format&fit=crop&w=1200&q=80',
    9: 'https://images.unsplash.com/photo-1537081538824-2fcad5cb096b?auto=format&fit=crop&w=1200&q=80',
    10: 'https://images.unsplash.com/photo-1651585594107-859f80b4ca3a?auto=format&fit=crop&w=1200&q=80',
    11: 'https://images.unsplash.com/photo-1646121342684-fcba59cf845c?auto=format&fit=crop&w=1200&q=80'
};

const PRODUCT_NAME_IMAGE_MAP = {
    'Baso Ikan': PRODUCT_IMAGE_MAP[1],
    'Baso Ikan Original': PRODUCT_IMAGE_MAP[1],
    'Baso Ikan Jumbo': PRODUCT_IMAGE_MAP[9],
    'Baso Ikan Mie': PRODUCT_IMAGE_MAP[10],
    'Es Teh': PRODUCT_IMAGE_MAP[11],
    'Es Teh Manis': PRODUCT_IMAGE_MAP[11]
};

const INVALID_IMAGE_PATTERNS = [
    'placehold.co',
    '/images/',
    'animasi-baso-ikan'
];

export const GENERIC_FOOD_IMAGE = PRODUCT_IMAGE_MAP[1];

export function getMappedProductImage(product = {}) {
    return PRODUCT_IMAGE_MAP[product.id] || PRODUCT_NAME_IMAGE_MAP[product.name] || null;
}

export function shouldReplaceImage(image) {
    if (typeof image !== 'string') return true;

    const trimmedImage = image.trim();
    if (!trimmedImage) return true;

    return INVALID_IMAGE_PATTERNS.some((pattern) => trimmedImage.includes(pattern));
}

export function getProductImage(product = {}) {
    const mappedImage = getMappedProductImage(product);

    if (mappedImage && shouldReplaceImage(product.image)) {
        return mappedImage;
    }

    if (typeof product.image === 'string' && product.image.trim()) {
        return product.image.trim();
    }

    return mappedImage || GENERIC_FOOD_IMAGE;
}

export function normalizeProduct(product = {}) {
    return {
        ...product,
        image: getProductImage(product)
    };
}

export function normalizeProducts(products = []) {
    return products
        .filter((product) => product && product.available !== false && product.is_available !== false)
        .map((product) => normalizeProduct(product));
}

export function normalizeCartItem(item = {}) {
    return {
        ...item,
        image: getProductImage(item)
    };
}

export function normalizeCartItems(items = []) {
    return items
        .filter(Boolean)
        .map((item) => normalizeCartItem(item));
}

export function normalizeOrders(orders = []) {
    return orders.map((order) => ({
        ...order,
        items: normalizeCartItems(order.items || [])
    }));
}
