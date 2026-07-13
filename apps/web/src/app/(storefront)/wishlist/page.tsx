import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { WishlistPageContent } from "@/features/wishlist/components/wishlist-page-content";

export const metadata: Metadata = {
  title: "Sản phẩm yêu thích",
  robots: { index: false },
};

export default function WishlistPage() {
  return (
    <Container className="space-y-6 py-12">
      <h1 className="font-display text-4xl font-bold text-heading">Sản phẩm yêu thích</h1>
      <WishlistPageContent />
    </Container>
  );
}
