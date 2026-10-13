"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  partId: string;
  sku: string;
  name: string;
  unitPrice: number;
  imageUrl: string | null;
  qty: number;
  stockQty: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (partId: string) => void;
  updateQty: (partId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "service-clinic:carrinho-pecas";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* localStorage indisponível ou dado corrompido - carrinho começa vazio */
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* quota cheia etc - carrinho continua funcionando só na sessão atual */
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.partId === item.partId);
      if (existing) {
        return prev.map((i) =>
          i.partId === item.partId
            ? { ...i, qty: Math.min(i.qty + qty, Math.max(i.stockQty, 1)) }
            : i
        );
      }
      return [...prev, { ...item, qty: Math.min(qty, Math.max(item.stockQty, 1)) }];
    });
  }, []);

  const removeItem = useCallback((partId: string) => {
    setItems((prev) => prev.filter((i) => i.partId !== partId));
  }, []);

  const updateQty = useCallback((partId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.partId === partId ? { ...i, qty: Math.max(1, Math.min(qty, Math.max(i.stockQty, 1))) } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((acc, i) => acc + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((acc, i) => acc + i.unitPrice * i.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQty, clear, count, subtotal }),
    [items, addItem, removeItem, updateQty, clear, count, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>.");
  return ctx;
}
