"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";

export function AddToCartButton({
  partId,
  sku,
  name,
  unitPrice,
  imageUrl,
  stockQty,
}: {
  partId: string;
  sku: string;
  name: string;
  unitPrice: number;
  imageUrl: string | null;
  stockQty: number;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (stockQty <= 0) {
    return (
      <Button variant="secondary" size="sm" disabled>
        Sem estoque
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={() => {
        addItem({ partId, sku, name, unitPrice, imageUrl, stockQty });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? "Adicionado ✓" : "Adicionar"}
    </Button>
  );
}
