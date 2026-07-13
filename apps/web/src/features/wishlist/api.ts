import { customerApiClient } from "@/lib/customer-api-client";
import type { WishlistItem } from "./types";

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const { data } = await customerApiClient.get<WishlistItem[]>("/api/v1/storefront/wishlist");
  return data;
}

export async function addToWishlist(productId: string): Promise<void> {
  await customerApiClient.post("/api/v1/storefront/wishlist", { productId });
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await customerApiClient.delete(`/api/v1/storefront/wishlist/${productId}`);
}
