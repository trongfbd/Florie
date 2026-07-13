"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCustomerAuthStore } from "@/stores/customer-auth-store";
import { useToggleWishlist, useWishlistQuery } from "../hooks";

export function WishlistButton({ productId }: { productId: string }) {
  const pathname = usePathname();
  const isLoggedIn = useCustomerAuthStore((state) => !!state.customer);
  const { data: wishlist } = useWishlistQuery();
  const { add, remove } = useToggleWishlist();

  if (!isLoggedIn) {
    return (
      <Link
        href={`/dang-nhap?redirect=${encodeURIComponent(pathname)}`}
        title="Đăng nhập để lưu vào yêu thích"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-secondary text-heading/60 transition-colors hover:border-accent hover:text-accent"
      >
        <Heart size={20} />
      </Link>
    );
  }

  const isSaved = wishlist?.some((item) => item.productId === productId) ?? false;

  return (
    <button
      type="button"
      onClick={() => (isSaved ? remove.mutate(productId) : add.mutate(productId))}
      disabled={add.isPending || remove.isPending}
      aria-pressed={isSaved}
      title={isSaved ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        isSaved
          ? "border-accent bg-accent text-white"
          : "border-secondary text-heading/60 hover:border-accent hover:text-accent"
      }`}
    >
      <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
    </button>
  );
}
