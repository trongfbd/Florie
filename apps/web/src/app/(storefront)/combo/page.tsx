import type { Metadata } from "next";
import { getCombos } from "@/lib/api-server";
import { ComboGrid } from "@/features/marketing/components/combo-grid";
import { FadeIn } from "@/components/motion/fade-in";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Combo hoa",
  description: "Các combo hoa được phối sẵn, giá ưu đãi hơn khi mua lẻ từng sản phẩm.",
};

export default async function ComboPage() {
  const combos = await getCombos();

  return (
    <Container className="space-y-8 py-12">
      <FadeIn className="text-center">
        <h1 className="font-display text-4xl font-bold text-heading">Combo hoa</h1>
        <p className="mt-2 text-foreground/70">Phối sẵn theo chủ đề, giá tốt hơn mua lẻ</p>
      </FadeIn>
      <ComboGrid combos={combos} />
    </Container>
  );
}
