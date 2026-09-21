"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { z } from "zod";
import { useProductOptions } from "@/features/admin-products/hooks";
import { useCombos } from "@/features/admin-combos/hooks";
import { useCustomers } from "@/features/admin-customers/hooks";
import { getErrorMessage } from "@/lib/get-error-message";
import { formatVnd } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-method-labels";
import { useCreateOrder, useOrders } from "../hooks";
import { DELIVERY_SLOTS } from "../lib/delivery-slots";
import { ORDER_CHANNEL_LABELS } from "../lib/channel-labels";
import type { CreateOrderItemInput, OrderChannel } from "../types";

const CHANNEL_OPTIONS: OrderChannel[] = ["ZALO", "FACEBOOK", "TIKTOK", "PHONE", "WALK_IN", "B2B"];
const PAYMENT_METHOD_OPTIONS = ["COD", "VNPAY", "MOMO", "ZALOPAY"] as const;

const schema = z.object({
  guestPhone: z.string().min(8, "Số điện thoại không hợp lệ"),
  guestName: z.string().min(2, "Vui lòng nhập tên người đặt"),
  recipientName: z.string().min(2, "Vui lòng nhập tên người nhận"),
  recipientPhone: z.string().min(8, "Số điện thoại không hợp lệ"),
  deliveryAddress: z.string().min(4, "Vui lòng nhập địa chỉ giao"),
  deliveryDistrict: z.string().optional(),
  deliveryDate: z.string().min(1, "Vui lòng chọn ngày giao"),
  deliveryTime: z.string().optional(),
  cardMessage: z.string().optional(),
  note: z.string().optional(),
  channel: z.enum(["ZALO", "FACEBOOK", "TIKTOK", "PHONE", "WALK_IN", "B2B"]),
  paymentMethod: z.enum(PAYMENT_METHOD_OPTIONS),
  shippingFee: z.coerce.number().min(0).optional(),
  depositAmount: z.coerce.number().min(0).optional(),
  voucherCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type ItemRow =
  | { mode: "product"; productId: string; quantity: number }
  | { mode: "combo"; comboId: string; quantity: number }
  | { mode: "custom"; customName: string; customPrice: number; quantity: number };

export function CreateOrderContent() {
  const router = useRouter();
  const { data: productsData } = useProductOptions();
  const { data: combosData } = useCombos({ page: 1 });
  const createMutation = useCreateOrder();

  const [items, setItems] = useState<ItemRow[]>([]);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { channel: "ZALO", paymentMethod: "COD" },
  });

  const guestPhone = watch("guestPhone");
  const recipientPhone = watch("recipientPhone");
  const deliveryDate = watch("deliveryDate");

  // Tìm khách cũ theo đúng SĐT đã nhập, tự điền tên nếu khớp -- không ghi
  // đè nếu admin đã tự gõ tên rồi.
  const phoneLookupEnabled = !!guestPhone && guestPhone.length >= 9;
  const { data: phoneMatch } = useCustomers({
    search: guestPhone ?? "",
    enabled: phoneLookupEnabled,
  });
  const matchedCustomer = phoneMatch?.data.find((c) => c.phone === guestPhone);

  useEffect(() => {
    if (matchedCustomer && !getValues("guestName")) {
      setValue("guestName", matchedCustomer.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedCustomer?.id]);

  // Cảnh báo trùng đơn: cùng SĐT người nhận + cùng ngày giao.
  const duplicateCheckEnabled = !!recipientPhone && recipientPhone.length >= 8 && !!deliveryDate;
  const { data: duplicateCheck } = useOrders({
    search: recipientPhone,
    deliveryDateFrom: deliveryDate,
    deliveryDateTo: deliveryDate,
    limit: 5,
    enabled: duplicateCheckEnabled,
  });
  const duplicates = duplicateCheck?.data.filter((o) => o.recipientPhone === recipientPhone) ?? [];

  function addItem(mode: ItemRow["mode"]) {
    if (mode === "product") {
      const first = productsData?.data[0];
      if (!first) return;
      setItems((prev) => [...prev, { mode: "product", productId: first.id, quantity: 1 }]);
    } else if (mode === "combo") {
      const first = combosData?.data[0];
      if (!first) return;
      setItems((prev) => [...prev, { mode: "combo", comboId: first.id, quantity: 1 }]);
    } else {
      setItems((prev) => [...prev, { mode: "custom", customName: "", customPrice: 0, quantity: 1 }]);
    }
    setItemsError(null);
  }

  function updateItem(index: number, patch: Record<string, unknown>) {
    setItems((prev) => prev.map((item, i) => (i === index ? ({ ...item, ...patch } as ItemRow) : item)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const itemsSubtotal = items.reduce((sum, item) => {
    if (item.mode === "product") {
      const product = productsData?.data.find((p) => p.id === item.productId);
      const price = product?.salePrice ?? product?.basePrice ?? 0;
      return sum + price * item.quantity;
    }
    if (item.mode === "combo") {
      const combo = combosData?.data.find((c) => c.id === item.comboId);
      return sum + (combo?.price ?? 0) * item.quantity;
    }
    return sum + item.customPrice * item.quantity;
  }, 0);

  function onSubmit(values: FormValues) {
    if (items.length === 0) {
      setItemsError("Cần ít nhất 1 sản phẩm/mẫu trong đơn.");
      return;
    }
    for (const item of items) {
      if (item.mode === "custom" && (!item.customName.trim() || item.customPrice <= 0)) {
        setItemsError("Mẫu tuỳ chỉnh cần có tên và giá lớn hơn 0.");
        return;
      }
    }
    setItemsError(null);

    const resolvedItems: CreateOrderItemInput[] = items.map((item) => {
      if (item.mode === "product") return { productId: item.productId, quantity: item.quantity };
      if (item.mode === "combo") return { comboId: item.comboId, quantity: item.quantity };
      return { customName: item.customName, customPrice: item.customPrice, quantity: item.quantity };
    });

    createMutation.mutate(
      {
        guestName: values.guestName,
        guestPhone: values.guestPhone,
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        deliveryAddress: values.deliveryAddress,
        deliveryDistrict: values.deliveryDistrict || undefined,
        deliveryDate: values.deliveryDate,
        deliveryTime: values.deliveryTime || undefined,
        cardMessage: values.cardMessage || undefined,
        note: values.note || undefined,
        channel: values.channel,
        paymentMethod: values.paymentMethod,
        shippingFee: values.shippingFee,
        depositAmount: values.depositAmount,
        voucherCode: values.voucherCode || undefined,
        items: resolvedItems,
      },
      { onSuccess: (order) => router.push(`/admin/don-hang/${order.id}`) },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <section className="space-y-4 rounded-brand border-2 border-secondary bg-white p-5">
        <h2 className="font-display text-lg font-bold text-heading">Người đặt</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-heading">Số điện thoại</label>
            <input
              {...register("guestPhone")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {errors.guestPhone && <p className="text-xs text-destructive">{errors.guestPhone.message}</p>}
            {matchedCustomer && (
              <p className="text-xs text-success">Đã tìm thấy khách cũ: {matchedCustomer.name}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-heading">Tên người đặt</label>
            <input
              {...register("guestName")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {errors.guestName && <p className="text-xs text-destructive">{errors.guestName.message}</p>}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Kênh đặt hàng</label>
          <select
            {...register("channel")}
            className="w-full max-w-xs rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {CHANNEL_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {ORDER_CHANNEL_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-4 rounded-brand border-2 border-secondary bg-white p-5">
        <h2 className="font-display text-lg font-bold text-heading">Người nhận &amp; giao hàng</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-heading">Tên người nhận</label>
            <input
              {...register("recipientName")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {errors.recipientName && (
              <p className="text-xs text-destructive">{errors.recipientName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-heading">SĐT người nhận</label>
            <input
              {...register("recipientPhone")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {errors.recipientPhone && (
              <p className="text-xs text-destructive">{errors.recipientPhone.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-semibold text-heading">Địa chỉ giao</label>
            <input
              {...register("deliveryAddress")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {errors.deliveryAddress && (
              <p className="text-xs text-destructive">{errors.deliveryAddress.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-heading">Quận/khu vực</label>
            <input
              {...register("deliveryDistrict")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        {duplicates.length > 0 && (
          <p className="rounded-lg bg-accent/10 px-3 py-2 text-xs font-semibold text-accent">
            Lưu ý: đã có {duplicates.length} đơn khác cùng SĐT người nhận và cùng ngày giao (
            {duplicates.map((o) => o.orderNumber).join(", ")}) — kiểm tra tránh trùng đơn.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-heading">Ngày giao</label>
            <input
              type="date"
              {...register("deliveryDate")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
            {errors.deliveryDate && <p className="text-xs text-destructive">{errors.deliveryDate.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-heading">Khung giờ giao</label>
            <select
              {...register("deliveryTime")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">-- Chọn khung giờ --</option>
              {DELIVERY_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Nội dung thiệp</label>
          <textarea
            rows={2}
            {...register("cardMessage")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-heading">Ghi chú nội bộ (chỉ admin thấy)</label>
          <textarea
            rows={2}
            {...register("note")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </section>

      <section className="space-y-3 rounded-brand border-2 border-secondary bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-heading">Sản phẩm</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addItem("product")}
              className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-heading hover:bg-secondary/70"
            >
              + Sản phẩm
            </button>
            <button
              type="button"
              onClick={() => addItem("combo")}
              className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-heading hover:bg-secondary/70"
            >
              + Combo
            </button>
            <button
              type="button"
              onClick={() => addItem("custom")}
              className="rounded-full bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25"
            >
              + Mẫu tuỳ chỉnh
            </button>
          </div>
        </div>

        {items.length === 0 && <p className="text-sm text-foreground/50">Chưa có sản phẩm nào.</p>}

        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 rounded-lg bg-secondary/20 p-2">
            {item.mode === "product" && (
              <select
                value={item.productId}
                onChange={(e) => updateItem(index, { productId: e.target.value })}
                className="flex-1 rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {productsData?.data.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatVnd(p.salePrice ?? p.basePrice)}
                  </option>
                ))}
              </select>
            )}
            {item.mode === "combo" && (
              <select
                value={item.comboId}
                onChange={(e) => updateItem(index, { comboId: e.target.value })}
                className="flex-1 rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {combosData?.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {formatVnd(c.price)}
                  </option>
                ))}
              </select>
            )}
            {item.mode === "custom" && (
              <>
                <input
                  placeholder="Tên mẫu (VD: Bó hoa theo mẫu khách gửi)"
                  value={item.customName}
                  onChange={(e) => updateItem(index, { customName: e.target.value })}
                  className="flex-1 rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Giá"
                  value={item.customPrice || ""}
                  onChange={(e) => updateItem(index, { customPrice: Number(e.target.value) })}
                  className="w-28 rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </>
            )}
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
              className="w-16 rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              aria-label="Xoá"
              className="text-foreground/40 hover:text-destructive"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {itemsError && <p className="text-xs text-destructive">{itemsError}</p>}
        <p className="text-sm text-foreground/50">Ảnh mẫu khách gửi có thể thêm sau khi lưu đơn.</p>
      </section>

      <section className="space-y-4 rounded-brand border-2 border-secondary bg-white p-5">
        <h2 className="font-display text-lg font-bold text-heading">Thanh toán</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-heading">Phương thức</label>
            <select
              {...register("paymentMethod")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {PAYMENT_METHOD_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-heading">Phí ship (VND)</label>
            <input
              type="number"
              min={0}
              {...register("shippingFee")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-heading">Tiền cọc đã nhận (VND)</label>
            <input
              type="number"
              min={0}
              {...register("depositAmount")}
              className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="space-y-1 max-w-xs">
          <label className="text-sm font-semibold text-heading">Mã voucher (nếu có)</label>
          <input
            {...register("voucherCode")}
            className="w-full rounded-lg border-2 border-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <p className="text-sm font-semibold text-heading">
          Tạm tính sản phẩm: <span className="text-accent">{formatVnd(itemsSubtotal)}</span> (chưa gồm ship/giảm giá — tổng cuối tính ở server)
        </p>
      </section>

      {createMutation.isError && (
        <p className="text-sm text-destructive">
          {getErrorMessage(createMutation.error, "Có lỗi xảy ra — vui lòng kiểm tra lại thông tin.")}
        </p>
      )}

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105 disabled:opacity-60"
      >
        {createMutation.isPending ? "Đang lưu..." : "Lưu đơn hàng"}
      </button>
    </form>
  );
}
