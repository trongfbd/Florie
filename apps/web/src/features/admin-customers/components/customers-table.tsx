"use client";

import Link from "next/link";
import { useState } from "react";
import { formatVnd } from "@/lib/format";
import { useCustomers } from "../hooks";

export function CustomersTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [vipOnly, setVipOnly] = useState(false);

  const { data, isLoading } = useCustomers({ page, search: search || undefined, isVip: vipOnly || undefined });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(searchInput);
          }}
        >
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm theo tên, SĐT, email..."
            className="w-64 rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Tìm
          </button>
        </form>
        <label className="flex items-center gap-2 rounded-lg border-2 border-secondary px-3 py-2 text-sm font-medium text-heading">
          <input
            type="checkbox"
            checked={vipOnly}
            onChange={(event) => {
              setPage(1);
              setVipOnly(event.target.checked);
            }}
            className="h-4 w-4 accent-accent"
          />
          Chỉ khách VIP
        </label>
      </div>

      <div className="overflow-x-auto rounded-brand border-2 border-secondary bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
            <tr>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">SĐT / Email</th>
              <th className="px-4 py-3">Tổng chi tiêu</th>
              <th className="px-4 py-3">VIP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-foreground/50">Đang tải...</td>
              </tr>
            )}
            {!isLoading && data?.data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-foreground/50">Không tìm thấy khách hàng nào.</td>
              </tr>
            )}
            {data?.data.map((customer) => (
              <tr key={customer.id} className="hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <Link href={`/admin/khach-hang/${customer.id}`} className="font-semibold text-accent hover:underline">
                    {customer.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/60">{customer.phone ?? customer.email ?? "—"}</td>
                <td className="px-4 py-3 font-semibold text-heading">{formatVnd(customer.totalSpent)}</td>
                <td className="px-4 py-3">
                  {customer.isVip && (
                    <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">VIP</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full border border-primary px-3 py-1.5 text-sm disabled:pointer-events-none disabled:text-foreground/30"
          >
            Trước
          </button>
          <span className="text-sm text-foreground/60">
            Trang {data.meta.page}/{data.meta.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-primary px-3 py-1.5 text-sm disabled:pointer-events-none disabled:text-foreground/30"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
