'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '../../../context/CartContext';

export default function ClearCartOnSuccess({ enabled = true }) {
    const { clearCart } = useCart();
    const hasClearedRef = useRef(false);

    useEffect(() => {
        if (!enabled || hasClearedRef.current) return;

        hasClearedRef.current = true;
        clearCart();
    }, [clearCart, enabled]);

    return null;
}
