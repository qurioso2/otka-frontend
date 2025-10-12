'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
  id: number;
  sku: string;
  name: string;
  price: number;
  image?: string | null;
  qty: number;
  stock_qty?: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  remove: (sku: string) => void;
  update: (sku: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('otka-cart');
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('otka-cart', JSON.stringify(items)); } catch {}
  }, [items]);

  const add: CartContextType['add'] = (item, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.sku === item.sku);
      const stockQty = item.stock_qty || 0;
      
      if (idx >= 0) {
        const clone = [...prev];
        const newQty = clone[idx].qty + qty;
        
        // Validate stock
        if (stockQty > 0 && newQty > stockQty) {
          alert(`Stoc insuficient. Disponibil: ${stockQty} bucăți`);
          return prev;
        }
        
        clone[idx] = { ...clone[idx], qty: newQty };
        return clone;
      }
      
      // Validate stock for new item
      if (stockQty > 0 && qty > stockQty) {
        alert(`Stoc insuficient. Disponibil: ${stockQty} bucăți`);
        return prev;
      }
      
      return [...prev, { ...item, qty }];
    });
  };

  const remove = (sku: string) => setItems((prev) => prev.filter((p) => p.sku !== sku));
  
  const update = (sku: string, qty: number) => setItems((prev) => {
    const item = prev.find((p) => p.sku === sku);
    if (item && item.stock_qty && qty > item.stock_qty) {
      alert(`Stoc insuficient. Disponibil: ${item.stock_qty} bucăți`);
      return prev;
    }
    return prev.map((p) => (p.sku === sku ? { ...p, qty } : p)).filter((p) => p.qty > 0);
  });
  
  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items]);
  const total = useMemo(() => items.reduce((a, b) => a + b.price * b.qty, 0), [items]);

  const value = { items, count, total, add, remove, update, clear };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
