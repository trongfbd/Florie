"use client";

import { Printer } from "lucide-react";
import { formatVnd } from "@/lib/format";
import { useOrder } from "../hooks";
import { useInvoiceSettings } from "@/features/admin-invoice-settings/hooks";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function OrderInvoiceView({ orderId }: { orderId: string }) {
  const { data: order, isLoading: isOrderLoading } = useOrder(orderId);
  const { data: settings, isLoading: isSettingsLoading } = useInvoiceSettings();

  if (isOrderLoading || isSettingsLoading || !order) {
    return <p className="p-8 text-center text-foreground/60">Đang tải...</p>;
  }

  const isEInvoiceReady = !!(settings?.eInvoiceTemplateCode && settings?.eInvoiceSeriesSymbol);
  const buyerName = order.customer?.name ?? order.guestName ?? "Khách vãng lai";
  const buyerPhone = order.customer?.phone ?? order.guestPhone ?? "";

  return (
    <div className="mx-auto max-w-3xl p-6 print:p-0">
      <button
        type="button"
        onClick={() => window.print()}
        className="mb-6 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105 print:hidden"
      >
        <Printer size={16} />
        In hóa đơn
      </button>

      <div className="rounded-brand border-2 border-secondary bg-white p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-start justify-between gap-4 border-b-2 border-dashed border-secondary pb-6">
          <div>
            <p className="font-display text-xl font-bold text-heading">{settings?.companyLegalName || "Bèo Flower Corner"}</p>
            {settings?.companyAddress && <p className="text-sm text-foreground/70">{settings.companyAddress}</p>}
            {settings?.companyPhone && <p className="text-sm text-foreground/70">SĐT: {settings.companyPhone}</p>}
            {settings?.companyEmail && <p className="text-sm text-foreground/70">Email: {settings.companyEmail}</p>}
            {settings?.taxCode && <p className="text-sm text-foreground/70">MST: {settings.taxCode}</p>}
          </div>
          <div className="text-right">
            <p className="font-display text-lg font-bold uppercase text-heading">
              {isEInvoiceReady ? "Hóa đơn điện tử bán hàng" : "Hóa đơn bán hàng"}
            </p>
            {isEInvoiceReady && (
              <>
                <p className="text-sm text-foreground/70">Mẫu số: {settings?.eInvoiceTemplateCode}</p>
                <p className="text-sm text-foreground/70">Ký hiệu: {settings?.eInvoiceSeriesSymbol}</p>
              </>
            )}
            <p className="mt-1 text-sm text-foreground/70">Số: {order.orderNumber}</p>
            <p className="text-sm text-foreground/70">Ngày: {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="grid gap-4 border-b border-secondary py-6 sm:grid-cols-2">
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-heading">Bên mua hàng</p>
            <p>{buyerName}</p>
            {buyerPhone && <p>SĐT: {buyerPhone}</p>}
            <p>Địa chỉ giao hàng: {order.deliveryAddress}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-heading">Thanh toán</p>
            <p>Hình thức: {order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Online"}</p>
            <p>Trạng thái: {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}</p>
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b-2 border-secondary text-left text-xs font-semibold uppercase text-foreground/60">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Tên hàng hóa</th>
              <th className="py-2 pr-2 text-right">SL</th>
              <th className="py-2 pr-2 text-right">Đơn giá</th>
              <th className="py-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary">
            {order.items.map((item, index) => (
              <tr key={item.id}>
                <td className="py-2 pr-2 text-foreground/60">{index + 1}</td>
                <td className="py-2 pr-2">{item.itemName}</td>
                <td className="py-2 pr-2 text-right">{item.quantity}</td>
                <td className="py-2 pr-2 text-right">{formatVnd(item.unitPrice)}</td>
                <td className="py-2 text-right font-medium">{formatVnd(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-4 max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-foreground/70">
            <span>Tạm tính</span>
            <span>{formatVnd(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-success">
              <span>Giảm giá {order.voucher ? `(${order.voucher.code})` : ""}</span>
              <span>-{formatVnd(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-foreground/70">
            <span>Phí vận chuyển</span>
            <span>{formatVnd(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between border-t border-secondary pt-1 text-base font-bold text-heading">
            <span>Tổng thanh toán</span>
            <span>{formatVnd(order.total)}</span>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <p className="font-semibold text-heading">Người mua hàng</p>
            <p className="text-xs text-foreground/50">(Ký, ghi rõ họ tên)</p>
          </div>
          <div>
            <p className="font-semibold text-heading">Người bán hàng</p>
            <p className="text-xs text-foreground/50">(Ký, ghi rõ họ tên)</p>
          </div>
        </div>

        {!isEInvoiceReady && (
          <p className="mt-10 text-center text-xs text-foreground/40 print:hidden">
            Đây là hóa đơn bán hàng nội bộ, chưa phải hóa đơn điện tử hợp lệ theo quy định thuế — cấu
            hình hóa đơn điện tử tại Cài đặt → Hóa đơn &amp; Thuế khi cần phát hành chính thức.
          </p>
        )}
      </div>
    </div>
  );
}
