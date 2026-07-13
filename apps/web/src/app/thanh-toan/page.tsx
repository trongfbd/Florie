import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";

export const metadata: Metadata = {
  title: "Thanh toán",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <Container className="space-y-6 py-12">
      <h1 className="font-display text-4xl font-bold text-heading">Thanh toán</h1>
      <CheckoutForm />
    </Container>
  );
}
