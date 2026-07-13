"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCartStore, useCartSubtotal } from "@/stores/cart-store";
import { useCustomerAuthStore } from "@/stores/customer-auth-store";
import { useLastOrderStore } from "@/stores/last-order-store";
import { formatVnd } from "@/lib/format";
import { createStorefrontOrder, validateVoucher } from "../api";
import type { VoucherPreviewResult } from "../types";

const baseSchema = z.object({
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
  recipientName: z.string().min(2, "Vui lòng nhập tên người nhận"),
  recipientPhone: z.string().min(9, "Số điện thoại không hợp lệ"),
  deliveryAddress: z.string().min(5, "Vui lòng nhập địa chỉ giao hoa"),
  deliveryDate: z.string().min(1, "Vui lòng chọn ngày giao"),
  deliveryTime: z.string().optional(),
  cardMessage: z.string().optional(),
  note: z.string().optional(),
  voucherCode: z.string().optional(),
});

type FormValues = z.infer<typeof baseSchema>;

const SHIPPING_FEE_PREVIEW = 30_000;

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const subtotal = useCartSubtotal();
  const customer = useCustomerAuthStore((state) => state.customer);
  const setLastOrder = useLastOrderStore((state) => state.setOrder);

  const schema = customer
    ? baseSchema
    : baseSchema
        .extend({
          guestName: z.string().min(2, "Vui lòng nhập tên của bạn"),
          guestPhone: z.string().min(9, "Số điện thoại không hợp lệ"),
        });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [voucherPreview, setVoucherPreview] = useState<VoucherPreviewResult | null>(null);
  const voucherCode = watch("voucherCode");

  const checkVoucher = useMutation({
    mutationFn: () => validateVoucher({ code: (voucherCode ?? "").trim(), subtotal }),
    onSuccess: setVoucherPreview,
    onError: () => setVoucherPreview(null),
  });

  const submitOrder = useMutation({
    mutationFn: (values: FormValues) =>
      createStorefrontOrder({
        ...values,
        paymentMethod: "COD",
        items: items.map((item) =>
          item.kind === "combo"
            ? { comboId: item.id, quantity: item.quantity }
            : { productId: item.id, quantity: item.quantity },
        ),
      }),
    onSuccess: (order) => {
      setLastOrder(order);
      clearCart();
      router.push(`/dat-hang-thanh-cong/${order.orderNumber}`);
    },
  });

  if (items.length === 0) {
    return <p className="text-foreground/60">Giỏ hàng trống — hãy thêm sản phẩm trước khi đặt hàng.</p>;
  }

  return (
    <form
      onSubmit={handleSubmit((values) => submitOrder.mutate(values))}
      className="grid gap-8 lg:grid-cols-3"
    >
      <div className="space-y-6 lg:col-span-2">
        {!customer && (
          <fieldset className="space-y-4 rounded-brand border-2 border-secondary bg-white p-5">
            <legend className="px-1 font-semibold text-heading">Thông tin người đặt</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-heading">Họ tên</label>
                <input
                  {...register("guestName")}
                  className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
                />
                {errors.guestName && <p className="text-xs text-destructive">{errors.guestName.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-heading">Số điện thoại</label>
                <input
                  {...register("guestPhone")}
                  className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
                />
                {errors.guestPhone && (
                  <p className="text-xs text-destructive">{errors.guestPhone.message}</p>
                )}
              </div>
            </div>
          </fieldset>
        )}

        <fieldset className="space-y-4 rounded-brand border-2 border-secondary bg-white p-5">
          <legend className="px-1 font-semibold text-heading">Thông tin giao hoa</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-heading">Tên người nhận</label>
              <input
                {...register("recipientName")}
                className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
              />
              {errors.recipientName && (
                <p className="text-xs text-destructive">{errors.recipientName.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-heading">SĐT người nhận</label>
              <input
                {...register("recipientPhone")}
                className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
              />
              {errors.recipientPhone && (
                <p className="text-xs text-destructive">{errors.recipientPhone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-heading">Địa chỉ giao hoa</label>
            <input
              {...register("deliveryAddress")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {errors.deliveryAddress && (
              <p className="text-xs text-destructive">{errors.deliveryAddress.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-heading">Ngày giao</label>
              <input
                type="date"
                {...register("deliveryDate")}
                className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
              />
              {errors.deliveryDate && (
                <p className="text-xs text-destructive">{errors.deliveryDate.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-heading">Giờ giao (không bắt buộc)</label>
              <input
                placeholder="VD: 09:00 - 11:00"
                {...register("deliveryTime")}
                className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-heading">Lời nhắn thiệp (không bắt buộc)</label>
            <textarea
              rows={2}
              {...register("cardMessage")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-heading">Ghi chú (không bắt buộc)</label>
            <textarea
              rows={2}
              {...register("note")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-brand border-2 border-secondary bg-white p-5">
          <legend className="px-1 font-semibold text-heading">Thanh toán</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" checked readOnly className="accent-accent" />
            Thanh toán khi nhận hàng (COD)
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground/40">
            <input type="radio" disabled className="accent-accent" />
            Thanh toán online (sắp ra mắt)
          </label>

          <div className="space-y-1 pt-2">
            <label className="text-sm font-medium text-heading">Mã giảm giá (không bắt buộc)</label>
            <div className="flex gap-2">
              <input
                {...register("voucherCode", { onChange: () => setVoucherPreview(null) })}
                placeholder="VD: FLORIE10"
                className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm uppercase outline-none focus:border-accent"
              />
              <button
                type="button"
                disabled={!voucherCode?.trim() || checkVoucher.isPending}
                onClick={() => checkVoucher.mutate()}
                className="shrink-0 rounded-lg border-2 border-accent px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-accent"
              >
                {checkVoucher.isPending ? "Đang kiểm tra..." : "Kiểm tra"}
              </button>
            </div>
            {voucherPreview && (
              <p className="text-xs font-semibold text-success">
                ✓ Áp dụng thành công — giảm {formatVnd(voucherPreview.discountAmount)}
              </p>
            )}
            {checkVoucher.isError && (
              <p className="text-xs text-destructive">Mã giảm giá không hợp lệ hoặc đã hết hạn.</p>
            )}
          </div>
        </fieldset>
      </div>

      <div className="h-fit space-y-3 rounded-brand border-2 border-secondary bg-secondary/40 p-6">
        <h2 className="font-display text-xl font-bold text-heading">Đơn hàng của bạn</h2>
        <ul className="space-y-1 text-sm text-foreground/70">
          {items.map((item) => (
            <li key={`${item.kind}-${item.id}`} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium text-heading">
                {formatVnd(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-secondary pt-2 text-sm">
          <div className="flex justify-between text-foreground/70">
            <span>Tạm tính</span>
            <span>{formatVnd(subtotal)}</span>
          </div>
          {voucherPreview && (
            <div className="flex justify-between text-success">
              <span>Giảm giá</span>
              <span>-{formatVnd(voucherPreview.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-foreground/70">
            <span>Phí vận chuyển</span>
            <span>{formatVnd(SHIPPING_FEE_PREVIEW)}</span>
          </div>
          <div className="mt-1 flex justify-between text-base font-bold text-heading">
            <span>Tổng cộng (tạm tính)</span>
            <span>
              {formatVnd(
                (voucherPreview ? subtotal - voucherPreview.discountAmount : subtotal) +
                  SHIPPING_FEE_PREVIEW,
              )}
            </span>
          </div>
          <p className="mt-1 text-xs text-foreground/50">
            Giá cuối cùng sẽ được xác nhận lại khi đặt hàng.
          </p>
        </div>

        {submitOrder.isError && (
          <p className="text-sm text-destructive">
            Đặt hàng thất bại — vui lòng kiểm tra lại thông tin và thử lại.
          </p>
        )}

        <button
          type="submit"
          disabled={submitOrder.isPending}
          className="w-full rounded-full bg-accent px-6 py-3 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {submitOrder.isPending ? "Đang đặt hàng..." : "Đặt hàng"}
        </button>
      </div>
    </form>
  );
}
