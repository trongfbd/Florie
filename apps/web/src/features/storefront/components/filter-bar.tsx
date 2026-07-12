"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "priceAsc", label: "Giá tăng dần" },
  { value: "priceDesc", label: "Giá giảm dần" },
  { value: "name", label: "Tên A-Z" },
] as const;

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const sort = searchParams.get("sort") ?? "newest";

  function applyParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-brand border border-primary/60 bg-secondary/40 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-foreground/70" htmlFor="minPrice">
          Giá từ
        </label>
        <input
          id="minPrice"
          type="number"
          min={0}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          onBlur={() => applyParams({ minPrice: minPrice || undefined })}
          placeholder="0"
          className="w-28 rounded-lg border border-primary/60 bg-white px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-foreground/70" htmlFor="maxPrice">
          Giá đến
        </label>
        <input
          id="maxPrice"
          type="number"
          min={0}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          onBlur={() => applyParams({ maxPrice: maxPrice || undefined })}
          placeholder="Không giới hạn"
          className="w-32 rounded-lg border border-primary/60 bg-white px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-foreground/70" htmlFor="sort">
          Sắp xếp
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => applyParams({ sort: e.target.value })}
          className="rounded-lg border border-primary/60 bg-white px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
