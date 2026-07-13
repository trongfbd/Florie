import type { Metadata } from "next";
import { getActiveFlashSale } from "@/lib/api-server";
import { FlashSaleSection } from "@/features/marketing/components/flash-sale-section";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Flash Sale",
  description: "Ưu đãi flash sale có thời hạn — số lượng giới hạn.",
};

export default async function FlashSalePage() {
  const flashSale = await getActiveFlashSale();

  return (
    <Container className="space-y-8 py-12">
      <h1 className="font-display text-4xl font-bold text-heading">Flash Sale</h1>
      {flashSale ? (
        <FlashSaleSection flashSale={flashSale} />
      ) : (
        <div className="rounded-brand border border-dashed border-primary bg-secondary/40 p-12 text-center text-foreground/60">
          Hiện không có chương trình flash sale nào đang diễn ra. Quay lại sau nhé!
        </div>
      )}
    </Container>
  );
}
