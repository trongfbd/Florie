import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { TrackingForm } from "@/features/order-tracking/components/tracking-form";

export const metadata: Metadata = {
  title: "Theo dõi đơn hàng",
};

export default function OrderTrackingPage() {
  return (
    <Container className="space-y-6 py-12">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-heading">Theo dõi đơn hàng</h1>
        <p className="mt-2 text-foreground/70">Nhập mã đơn hàng và số điện thoại để xem trạng thái</p>
      </div>
      <Suspense>
        <TrackingForm />
      </Suspense>
    </Container>
  );
}
