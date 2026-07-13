"use client";

import { useState } from "react";
import { formatVnd } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/features/order-tracking/status-labels";
import { useAddCustomerNote, useCustomer, useRemoveCustomerNote, useSetCustomerVip } from "../hooks";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function CustomerDetailContent({ customerId }: { customerId: string }) {
  const { data: customer, isLoading } = useCustomer(customerId);
  const setVip = useSetCustomerVip(customerId);
  const addNote = useAddCustomerNote(customerId);
  const removeNote = useRemoveCustomerNote(customerId);
  const [noteText, setNoteText] = useState("");

  if (isLoading || !customer) {
    return <p className="text-foreground/60">Đang tải...</p>;
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    addNote.mutate(noteText.trim(), { onSuccess: () => setNoteText("") });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-brand border-2 border-secondary bg-white p-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-heading">{customer.name}</h1>
          <p className="mt-1 text-sm text-foreground/60">
            {customer.phone ?? "Chưa có SĐT"} · {customer.email ?? "Chưa có email"}
          </p>
          <p className="mt-1 text-sm text-foreground/60">
            Tổng chi tiêu: <span className="font-semibold text-heading">{formatVnd(customer.totalSpent)}</span> ·{" "}
            {customer._count.orders} đơn hàng · Tham gia {formatDate(customer.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVip.mutate(!customer.isVip)}
          disabled={setVip.isPending}
          className={`rounded-full px-5 py-2 text-sm font-bold shadow-md transition-transform hover:scale-105 disabled:opacity-60 ${
            customer.isVip
              ? "bg-secondary text-foreground/70"
              : "bg-accent text-white shadow-accent/30"
          }`}
        >
          {customer.isVip ? "Bỏ đánh dấu VIP" : "Đánh dấu VIP"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-brand border-2 border-secondary bg-white p-5">
          <h2 className="font-display text-lg font-bold text-heading">Đơn hàng gần đây</h2>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-foreground/50">Chưa có đơn hàng nào.</p>
          ) : (
            <ul className="divide-y divide-secondary">
              {customer.orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-heading">{order.orderNumber}</p>
                    <p className="text-xs text-foreground/50">{formatDate(order.createdAt)} · {ORDER_STATUS_LABELS[order.status] ?? order.status}</p>
                  </div>
                  <span className="font-semibold text-heading">{formatVnd(order.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3 rounded-brand border-2 border-secondary bg-white p-5">
          <h2 className="font-display text-lg font-bold text-heading">Địa chỉ</h2>
          {customer.addresses.length === 0 ? (
            <p className="text-sm text-foreground/50">Chưa có địa chỉ nào.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {customer.addresses.map((address) => (
                <li key={address.id}>
                  <p className="font-medium text-heading">
                    {address.recipientName} · {address.phone}
                    {address.isDefault && (
                      <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">Mặc định</span>
                    )}
                  </p>
                  <p className="text-foreground/60">
                    {[address.addressLine, address.ward, address.district, address.province]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="space-y-3 rounded-brand border-2 border-secondary bg-white p-5">
        <h2 className="font-display text-lg font-bold text-heading">Ghi chú nội bộ</h2>
        <div className="flex gap-2">
          <input
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="Thêm ghi chú về khách hàng..."
            className="flex-1 rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={handleAddNote}
            disabled={addNote.isPending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
          >
            Thêm
          </button>
        </div>
        {customer.notes.length === 0 ? (
          <p className="text-sm text-foreground/50">Chưa có ghi chú nào.</p>
        ) : (
          <ul className="space-y-2">
            {customer.notes.map((note) => (
              <li key={note.id} className="flex items-start justify-between gap-3 rounded-lg bg-secondary/30 p-3 text-sm">
                <div>
                  <p className="text-heading">{note.content}</p>
                  <p className="mt-1 text-xs text-foreground/50">
                    {note.author.name} · {formatDate(note.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeNote.mutate(note.id)}
                  className="shrink-0 text-xs font-semibold text-destructive hover:underline"
                >
                  Xoá
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
