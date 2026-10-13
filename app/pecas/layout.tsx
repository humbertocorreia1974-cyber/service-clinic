import { CartProvider } from "./cart-context";

export default function PecasLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
