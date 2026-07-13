"use client";

import { formatVnd } from "@/lib/format";
import { useTopProducts } from "../hooks";

export function TopProductsList() {
  const { data, isLoading } = useTopProducts();

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-brand bg-secondary/50" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-brand border border-dashed border-secondary text-sm text-foreground/50">
        Chưa có sản phẩm bán ra trong 30 ngày qua
      </div>
    );
  }

  return (
    <ul className="divide-y divide-secondary">
      {data.map((product, index) => (
        <li key={product.productId} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-heading">
              {index + 1}
            </span>
            <span className="font-medium text-heading">{product.name}</span>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-heading">{formatVnd(product.revenue)}</p>
            <p className="text-xs text-foreground/50">{product.quantitySold} đã bán</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
