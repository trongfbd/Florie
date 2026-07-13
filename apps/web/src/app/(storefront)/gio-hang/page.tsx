import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { CartPageContent } from "@/features/cart/components/cart-page-content";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <Container className="space-y-6 py-12">
      <h1 className="font-display text-4xl font-bold text-heading">Giỏ hàng</h1>
      <CartPageContent />
    </Container>
  );
}
