import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { OrderConfirmation } from "@/features/checkout/components/order-confirmation";

export const metadata: Metadata = {
  title: "Đặt hàng thành công",
  robots: { index: false },
};

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  return (
    <Container className="py-16">
      <OrderConfirmation orderNumber={orderNumber} />
    </Container>
  );
}
