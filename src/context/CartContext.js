'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: 'Baso Ikan',
        description: 'Baso ikan goreng renyah disajikan dengan saus manis atau pedas.',
        price: 15000,
        category: 'Gorengan',
        image: '/images/animasi-baso-ikan.png',
        popular: true,
        available: true
    },
    {
        id: 2,
        name: 'Baso Cumi',
        description: 'Baso cumi premium, lebih besar dan lebih enak. Cocok untuk cemilan.',
        price: 20000,
        category: 'Gorengan',
        image: 'https://placehold.co/400x300/e2e8f0/1e40af?text=Baso+Cumi',
        popular: false,
        available: true
    },
    {
        id: 3,
        name: 'Kikiam',
        description: 'Kikiam ayam dan sayuran otentik yang digoreng sempurna.',
        price: 15000,
        category: 'Gorengan',
        image: 'https://placehold.co/400x300/e2e8f0/1e40af?text=Kikiam',
        popular: true,
        available: true
    },
    {
        id: 4,
        name: 'Es Gulaman',
        description: 'Minuman jelly manis yang menyegarkan dengan es. Pelepas dahaga yang sempurna.',
        price: 10000,
        category: 'Minuman',
        image: 'https://placehold.co/400x300/e2e8f0/1e40af?text=Gulaman',
        popular: false,
        available: true
    },
    {
        id: 5,
        name: 'Siomay Babi',
        description: '4pcs siomay babi kukus dengan saus kecap calamansi.',
        price: 25000,
        category: 'Kukus',
        image: 'https://placehold.co/400x300/e2e8f0/1e40af?text=Siomay',
        popular: false,
        available: true
    },
    {
        id: 6,
        name: 'Sosis Goreng',
        description: 'Sosis merah juicy digoreng dan disajikan dengan tusuk sate.',
        price: 18000,
        category: 'Gorengan',
        image: 'https://placehold.co/400x300/e2e8f0/1e40af?text=Sosis',
        popular: true,
        available: true
    },
    {
        id: 7,
        name: 'Paket Spesial Kombo',
        description: 'Baso Ikan + Kikiam + Minuman',
        price: 45000,
        category: 'Paket',
        image: '/images/',
        popular: false,
        available: true
    },
    {
        id: 8,
        name: 'Paket Trio Baso Ikan Pedas',
        description: 'Jajanan favorit klasik disajikan dengan cuka manis & pedas khas kami. Cocok untuk dinikmati ramai-ramai.',
        price: 25000,
        category: 'Paket',
        image: '/images/',
        popular: true,
        available: true
    }
];

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState(DEFAULT_PRODUCTS);
    const [orders, setOrders] = useState([]);
    const [reports, setReports] = useState([]);

    // Load data from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('ebaso_cart');
        if (savedCart) setCartItems(JSON.parse(savedCart));

        const savedProducts = localStorage.getItem('ebaso_products');
        if (savedProducts) setProducts(JSON.parse(savedProducts));
        else localStorage.setItem('ebaso_products', JSON.stringify(DEFAULT_PRODUCTS));

        const savedOrders = localStorage.getItem('ebaso_orders');
        if (savedOrders) setOrders(JSON.parse(savedOrders));

        const savedReports = localStorage.getItem('ebaso_reports');
        if (savedReports) setReports(JSON.parse(savedReports));

        // Listener for storage changes (auto-sync between tabs)
        const handleStorageChange = (e) => {
            if (e.key === 'ebaso_orders') {
                setOrders(JSON.parse(e.newValue || '[]'));
            }
            if (e.key === 'ebaso_products') {
                setProducts(JSON.parse(e.newValue || '[]'));
            }
            if (e.key === 'ebaso_reports') {
                setReports(JSON.parse(e.newValue || '[]'));
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
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item =>
                item.id === product.id &&
                JSON.stringify(item.extras) === JSON.stringify(extras)
            );

            if (existingItemIndex > -1) {
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += quantity;
                return newItems;
            } else {
                return [...prevItems, { ...product, product_id: product.id, quantity, extras }];
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

    const checkout = (metadata = {}) => {
        if (cartItems.length === 0) return;

        const newOrder = {
            id: `#ORD-${Date.now()}`,
            date: new Date().toLocaleString('id-ID'),
            items: [...cartItems],
            total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'Menunggu',
            timestamp: Date.now(),
            ...metadata
        };

        const updatedOrders = [newOrder, ...orders];
        setOrders(updatedOrders);
        localStorage.setItem('ebaso_orders', JSON.stringify(updatedOrders)); // Force update for event
        clearCart();
        return newOrder.id;
    };

    // Admin Helpers
    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    const deleteOrder = (orderId) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
    };

    const addProduct = (product) => {
        setProducts(prev => [...prev, { ...product, id: Date.now(), available: true }]);
    };

    const updateProduct = (productId, updatedProduct) => {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updatedProduct } : p));
    };

    const deleteProduct = (productId) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    const addReport = (newReport) => {
        const reportWithMeta = {
            id: Date.now(),
            status: 'Baru',
            timestamp: new Date(),
            ...newReport
        };
        setReports(prev => {
            const updated = [reportWithMeta, ...prev];
            localStorage.setItem('ebaso_reports', JSON.stringify(updated));
            return updated;
        });
        console.log('Report added in Context:', reportWithMeta);
    };

    const updateReportStatus = (reportId, newStatus) => {
        setReports(prev => {
            const updated = prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r);
            localStorage.setItem('ebaso_reports', JSON.stringify(updated));
            return updated;
        });
        console.log(`Report ${reportId} status updated to:`, newStatus);
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
