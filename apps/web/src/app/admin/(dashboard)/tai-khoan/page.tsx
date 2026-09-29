import type { Metadata } from "next";
import Link from "next/link";
import { UsersTable } from "@/features/admin-users/components/users-table";

export const metadata: Metadata = { title: "Quản lý tài khoản", robots: { index: false } };

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-heading">Quản lý tài khoản</h1>
        <Link
          href="/admin/tai-khoan/moi"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105"
        >
          + Tạo tài khoản
        </Link>
      </div>
      <UsersTable />
    </div>
  );
}
