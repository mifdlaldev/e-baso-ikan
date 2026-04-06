'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getProductImage,
    normalizeCartItem,
    normalizeCartItems,
    normalizeOrders,
    normalizeProduct,
    normalizeProducts
} from '../lib/productImages';
import { MENU_PRODUCTS } from '../lib/productCatalog';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import {
    buildOrderInsertPayload,
    mapDbProductToApp,
    mapReportInsertPayload
} from '../lib/supabase/mappers';
import { useAuth } from './AuthContext';

const CartContext = createContext();

function isMidtransEnumError(error) {
    return Boolean(
        error?.code === '22P02' &&
        /invalid input value for enum payment_method/i.test(error.message || '')
    );
}

const getStoredValue = (key, fallbackValue, normalizer = (value) => value) => {
    if (typeof window === 'undefined') return fallbackValue;

    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) return fallbackValue;

    return normalizer(JSON.parse(storedValue));
};

const DEFAULT_PRODUCTS = MENU_PRODUCTS.map((product) => ({
    ...product,
    image: getProductImage(product)
}));

const mergeStoredProducts = (storedProducts = []) => (
    Array.isArray(storedProducts) && storedProducts.length > 0
        ? normalizeProducts(storedProducts)
        : normalizeProducts(DEFAULT_PRODUCTS)
);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState(() => getStoredValue('ebaso_cart', [], normalizeCartItems));
    const [products, setProducts] = useState(() => getStoredValue('ebaso_products', DEFAULT_PRODUCTS, mergeStoredProducts));
    const [orders, setOrders] = useState(() => getStoredValue('ebaso_orders', [], normalizeOrders));
    const [reports, setReports] = useState(() => getStoredValue('ebaso_reports', []));

    useEffect(() => {
        const loadProductsFromSupabase = async () => {
            const supabase = getSupabaseBrowserClient();
            if (!supabase) return;

            const { data, error } = await supabase
                .from('products')
                .select(`
                    id,
                    slug,
                    name,
                    short_name,
                    description,
                    long_description,
                    category,
                    price,
                    image_url,
                    is_featured,
                    is_available,
                    accent_gradient,
                    calories_label,
                    prep_time_label,
                    freshness_label,
                    serving_note,
                    sort_order,
                    product_addons (
                        code,
                        label,
                        price,
                        is_active,
                        sort_order
                    )
                `)
                .order('sort_order', { ascending: true });

            if (error || !data) {
                console.warn('Failed to load Supabase products:', error?.message);
                return;
            }

            const remoteProducts = data.map((productRow) => mapDbProductToApp(productRow));
            const normalizedRemoteProducts = normalizeProducts(remoteProducts);
            setProducts(normalizedRemoteProducts);
            localStorage.setItem('ebaso_products', JSON.stringify(normalizedRemoteProducts));
        };

        loadProductsFromSupabase();
    }, []);

    useEffect(() => {
        // Listener for storage changes (auto-sync between tabs)
        const handleStorageChange = (e) => {
            if (e.key === 'ebaso_orders') {
                setOrders(normalizeOrders(JSON.parse(e.newValue || '[]')));
            }
            if (e.key === 'ebaso_products') {
                setProducts(mergeStoredProducts(JSON.parse(e.newValue || '[]')));
            }
            if (e.key === 'ebaso_reports') {
                setReports(JSON.parse(e.newValue || '[]'));
            }
            if (e.key === 'ebaso_cart') {
                setCartItems(normalizeCartItems(JSON.parse(e.newValue || '[]')));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Save helpers
    useEffect(() => {
        localStorage.setItem('ebaso_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('ebaso_products', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('ebaso_orders', JSON.stringify(orders));
    }, [orders]);

    useEffect(() => {
        localStorage.setItem('ebaso_reports', JSON.stringify(reports));
    }, [reports]);

    const addToCart = (product, quantity = 1, extras = {}) => {
        const normalizedProduct = normalizeCartItem(product);

        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item =>
                item.id === normalizedProduct.id &&
                JSON.stringify(item.extras) === JSON.stringify(extras)
            );

            if (existingItemIndex > -1) {
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += quantity;
                return newItems;
            } else {
                return [...prevItems, { ...normalizedProduct, product_id: normalizedProduct.id, quantity, extras }];
            }
        });
    };

    const removeFromCart = (index) => {
        setCartItems(prevItems => prevItems.filter((_, i) => i !== index));
    };

    const updateQuantity = (index, delta) => {
        setCartItems(prevItems => {
            const newItems = [...prevItems];
            const updatedItem = { ...newItems[index] };
            updatedItem.quantity += delta;

            if (updatedItem.quantity <= 0) {
                return prevItems.filter((_, i) => i !== index);
            }

            newItems[index] = updatedItem;
            return newItems;
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const checkout = async (metadata = {}, options = {}) => {
        if (cartItems.length === 0) return;

        const serviceFee = cartItems.length > 0 ? 2000 : 0;
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shouldClearCart = options.clearCart !== false;

        const newOrder = {
            id: `#ORD-${Date.now()}`,
            date: new Date().toLocaleString('id-ID'),
            items: [...cartItems],
            total: subtotal + serviceFee,
            serviceFee,
            status: 'Menunggu',
            timestamp: Date.now(),
            ...metadata
        };

        const updatedOrders = [newOrder, ...orders];
        setOrders(updatedOrders);
        localStorage.setItem('ebaso_orders', JSON.stringify(updatedOrders)); // Force update for event

        const supabase = getSupabaseBrowserClient();
        let insertedOrderId = null;

        if (supabase) {
            const payload = buildOrderInsertPayload({
                cartItems,
                metadata: {
                    ...metadata,
                    profileId: user?.id ?? null
                }
            });
            let { data: insertedOrder, error: orderError } = await supabase
                .from('orders')
                .insert(payload.order)
                .select('id, order_code')
                .single();

            if (orderError && metadata.paymentMethod === 'midtrans' && isMidtransEnumError(orderError)) {
                console.warn('Midtrans enum belum aktif di database, fallback insert order memakai payment_method tunai.');

                const fallbackResult = await supabase
                    .from('orders')
                    .insert({
                        ...payload.order,
                        payment_method: 'tunai'
                    })
                    .select('id, order_code')
                    .single();

                insertedOrder = fallbackResult.data;
                orderError = fallbackResult.error;
            }

            if (orderError) {
                console.warn('Failed to insert order into Supabase:', orderError.message);
            } else if (insertedOrder?.id) {
                insertedOrderId = insertedOrder.id;
                const { error: itemError } = await supabase
                    .from('order_items')
                    .insert(payload.items.map((item) => ({
                        ...item,
                        order_id: insertedOrder.id
                    })));

                if (itemError) {
                    console.warn('Failed to insert order items into Supabase:', itemError.message);
                } else if (insertedOrder.order_code) {
                    newOrder.id = insertedOrder.order_code;
                    const syncedOrders = [{ ...newOrder }, ...orders];
                    setOrders(syncedOrders);
                    localStorage.setItem('ebaso_orders', JSON.stringify(syncedOrders));
                }
            }
        }

        if (shouldClearCart) {
            clearCart();
        }

        return {
            orderId: newOrder.id,
            total: newOrder.total,
            serviceFee,
            subtotal,
            supabaseOrderId: insertedOrderId
        };
    };

    // Admin Helpers
    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    const deleteOrder = (orderId) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
    };

    const addProduct = (product) => {
        setProducts(prev => [...prev, normalizeProduct({ ...product, id: Date.now(), available: true })]);
    };

    const updateProduct = (productId, updatedProduct) => {
        setProducts(prev => prev.map(p => (
            p.id === productId ? normalizeProduct({ ...p, ...updatedProduct }) : p
        )));
    };

    const deleteProduct = (productId) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    const addReport = async (newReport) => {
        const reportWithMeta = {
            id: Date.now(),
            status: 'Baru',
            timestamp: new Date(),
            profile_id: user?.id ?? null,
            ...newReport
        };
        setReports(prev => {
            const updated = [reportWithMeta, ...prev];
            localStorage.setItem('ebaso_reports', JSON.stringify(updated));
            return updated;
        });

        const supabase = getSupabaseBrowserClient();
        if (supabase) {
            const { error } = await supabase
                .from('feedback_reports')
                .insert(mapReportInsertPayload(reportWithMeta));

            if (error) {
                console.warn('Failed to insert feedback report into Supabase:', error.message);
            }
        }
    };

    const updateReportStatus = (reportId, newStatus) => {
        setReports(prev => {
            const updated = prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r);
            localStorage.setItem('ebaso_reports', JSON.stringify(updated));
            return updated;
        });
    };

    const deleteReport = (reportId) => {
        setReports(prev => {
            const updated = prev.filter(r => r.id !== reportId);
            localStorage.setItem('ebaso_reports', JSON.stringify(updated));
            return updated;
        });
    };

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems, products, menus: products, orders,
            addToCart, removeFromCart, updateQuantity, clearCart, checkout,
            updateOrderStatus, deleteOrder,
            addProduct, updateProduct, deleteProduct,
            reports, addReport, deleteReport, updateReportStatus,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
}
