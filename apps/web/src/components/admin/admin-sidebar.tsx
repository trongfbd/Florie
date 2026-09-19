"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
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
  CalendarDays,
  DatabaseBackup,
  Warehouse,
  Truck,
  X,
} from "lucide-react";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { useAdminUiStore } from "@/stores/admin-ui-store";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  adminOnly?: boolean;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Chính",
    items: [
      { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
      { href: "/admin/don-hang", label: "Đơn hàng", icon: ShoppingBag },
      { href: "/admin/lich-giao-hang", label: "Lịch giao hàng", icon: CalendarDays },
      { href: "/admin/san-pham", label: "Sản phẩm", icon: Package },
      { href: "/admin/danh-muc", label: "Danh mục", icon: Tags },
    ],
  },
  {
    label: "Kho hàng",
    items: [
      { href: "/admin/vat-tu", label: "Vật tư", icon: Warehouse },
      { href: "/admin/nha-cung-cap", label: "Nhà cung cấp", icon: Truck },
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
      { href: "/admin/cai-dat", label: "Cài đặt", icon: Settings },
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
  {
    label: "Hệ thống",
    items: [{ href: "/admin/sao-luu", label: "Sao lưu & Khôi phục", icon: DatabaseBackup, adminOnly: true }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const role = useAdminAuthStore((state) => state.admin?.role);
  const isMobileOpen = useAdminUiStore((state) => state.isMobileSidebarOpen);
  const closeMobileSidebar = useAdminUiStore((state) => state.closeMobileSidebar);

  const nav = (
    <nav className="flex-1 space-y-5 overflow-y-auto p-3">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="px-3 text-xs font-bold uppercase tracking-wide text-foreground/40">{group.label}</p>
          {group.items
            .filter((item) => !item.adminOnly || role === "ADMIN")
            .map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileSidebar}
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
  );

  return (
    <>
      {/* Desktop: static sidebar, always visible */}
      <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-secondary bg-white sm:flex sm:flex-col">
        <div className="border-b border-secondary px-6 py-5">
          <Link href="/admin" className="font-display text-xl font-bold text-accent">
            Bèo Flower Corner Admin
          </Link>
        </div>
        {nav}
      </aside>

      {/* Mobile: slide-in drawer, toggled from the topbar's hamburger button */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={closeMobileSidebar}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-secondary px-4 py-4">
              <Link
                href="/admin"
                onClick={closeMobileSidebar}
                className="font-display text-lg font-bold text-accent"
              >
                Bèo Flower Corner Admin
              </Link>
              <button
                type="button"
                aria-label="Đóng menu"
                onClick={closeMobileSidebar}
                className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/50 hover:bg-secondary"
              >
                <X size={20} />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
