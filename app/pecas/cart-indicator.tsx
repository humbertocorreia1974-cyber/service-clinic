"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./cart-context";

export function CartIndicator() {
  const { count } = useCart();

  return (
    <Link
      href="/pecas/carrinho"
      className="relative inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-fg transition-colors hover:border-brand/50"
    >
      <ShoppingCart className="h-4 w-4" />
      Carrinho
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-fg">
          {count}
        </span>
      )}
    </Link>
  );
}
