export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    salePrice: number | null;
    category: { id: string; name: string; slug: string };
    images: { id: string; url: string; altText: string | null }[];
  };
}
