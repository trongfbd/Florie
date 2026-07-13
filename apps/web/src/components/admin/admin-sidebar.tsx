"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, ShoppingBag } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/don-hang", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/san-pham", label: "Sản phẩm", icon: Package },
  { href: "/admin/danh-muc", label: "Danh mục", icon: Tags },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-secondary bg-white sm:flex sm:flex-col">
      <div className="border-b border-secondary px-6 py-5">
        <Link href="/admin" className="font-display text-xl font-bold text-accent">
          Florie Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive ? "bg-accent text-white" : "text-heading/70 hover:bg-secondary"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
