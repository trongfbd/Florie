"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export function SearchBox() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(value.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xs">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tìm hoa..."
        className="w-full rounded-full border border-primary/60 bg-white px-4 py-2 pr-10 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        aria-label="Tìm kiếm"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-accent hover:bg-primary"
      >
        <Search size={16} />
      </button>
    </form>
  );
}
