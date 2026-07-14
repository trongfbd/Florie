"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useCustomerAuthStore } from "@/stores/customer-auth-store";
import { formatVnd } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { useToggleWishlist, useWishlistQuery } from "../hooks";

function WishlistGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-brand border-2 border-secondary bg-white shadow-sm">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WishlistPageContent() {
  const router = useRouter();
  const customer = useCustomerAuthStore((state) => state.customer);
  const hasHydrated = useCustomerAuthStore((state) => state.hasHydrated);
  const { data: wishlist, isLoading } = useWishlistQuery();
  const { remove } = useToggleWishlist();

  useEffect(() => {
    if (hasHydrated && !customer) {
      router.replace("/dang-nhap?redirect=/wishlist");
    }
  }, [hasHydrated, customer, router]);

  if (!hasHydrated || !customer) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  if (isLoading) {
    return <WishlistGridSkeleton />;
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="rounded-brand border-2 border-dashed border-secondary bg-secondary/30 p-16 text-center">
        <p className="text-lg font-semibold text-heading">Bạn chưa lưu sản phẩm nào</p>
        <Link
          href="/tim-kiem"
          className="mt-4 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/30 transition-transform hover:scale-105"
        >
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {wishlist.map((item) => (
        <div
          key={item.id}
          className="group overflow-hidden rounded-brand border-2 border-secondary bg-white shadow-sm"
        >
          <Link href={`/san-pham/${item.product.slug}`} className="relative block aspect-square bg-secondary">
            {item.product.images[0] && (
              <Image
                src={item.product.images[0].url}
                alt={item.product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}
          </Link>
          <div className="space-y-1 p-4">
            <Link href={`/san-pham/${item.product.slug}`} className="font-semibold text-heading hover:text-accent">
              {item.product.name}
            </Link>
            <div className="flex items-center justify-between">
              <span className="font-bold text-accent">
                {formatVnd(item.product.salePrice ?? item.product.basePrice)}
              </span>
              <button
                type="button"
                onClick={() => remove.mutate(item.productId)}
                aria-label="Bỏ khỏi yêu thích"
                className="text-foreground/40 transition-colors hover:text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
