"use client";

import { Heart, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useCartCount } from "@/stores/cart-store";
import { useCustomerAuthStore } from "@/stores/customer-auth-store";

export function HeaderActions() {
  const cartCount = useCartCount();
  const customer = useCustomerAuthStore((state) => state.customer);

  return (
    <div className="flex items-center gap-1">
      <Link
        href={customer ? "/wishlist" : "/dang-nhap?redirect=/wishlist"}
        aria-label="Yêu thích"
        className="rounded-full p-2.5 text-heading/60 transition-colors hover:bg-primary hover:text-accent"
      >
        <Heart size={18} />
      </Link>

      <Link
        href="/gio-hang"
        aria-label="Giỏ hàng"
        className="relative rounded-full p-2.5 text-heading/60 transition-colors hover:bg-primary hover:text-accent"
      >
        <ShoppingBag size={18} />
        {cartCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </Link>

      <Link
        href={customer ? "/tai-khoan" : "/dang-nhap"}
        aria-label="Tài khoản"
        className="rounded-full p-2.5 text-heading/60 transition-colors hover:bg-primary hover:text-accent"
      >
        <User size={18} />
      </Link>
    </div>
  );
}
