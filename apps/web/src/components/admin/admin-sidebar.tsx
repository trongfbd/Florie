"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Ticket,
  Gift,
  Zap,
  Image as ImageIcon,
  Newspaper,
  Bell,
  Settings,
  Users,
  Wallet,
  Sparkles,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Chính",
    items: [
      { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
      { href: "/admin/don-hang", label: "Đơn hàng", icon: ShoppingBag },
      { href: "/admin/san-pham", label: "Sản phẩm", icon: Package },
      { href: "/admin/danh-muc", label: "Danh mục", icon: Tags },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/voucher", label: "Voucher", icon: Ticket },
      { href: "/admin/combo", label: "Combo", icon: Gift },
      { href: "/admin/flash-sale", label: "Flash Sale", icon: Zap },
      { href: "/admin/banner", label: "Banner", icon: ImageIcon },
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
      { href: "/admin/popup", label: "Popup", icon: Bell },
      { href: "/admin/cai-dat", label: "Cài đặt Pixel", icon: Settings },
    ],
  },
  {
    label: "Kinh doanh",
    items: [
      { href: "/admin/khach-hang", label: "Khách hàng", icon: Users },
      { href: "/admin/chi-phi", label: "Chi phí", icon: Wallet },
    ],
  },
  {
    label: "Trợ lý AI",
    items: [{ href: "/admin/tro-ly-ban-hang", label: "Trợ lý bán hàng", icon: Sparkles }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-secondary bg-white sm:flex sm:flex-col">
      <div className="border-b border-secondary px-6 py-5">
        <Link href="/admin" className="font-display text-xl font-bold text-accent">
          Florie Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-5 p-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 text-xs font-bold uppercase tracking-wide text-foreground/40">{group.label}</p>
            {group.items.map((item) => {
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
          </div>
        ))}
      </nav>
    </aside>
  );
}
