"use client";

import { AlertTriangle } from "lucide-react";
import { useAiStatus, useInventoryInsights } from "../hooks";

export function InventoryInsightsCard() {
  const { data: status } = useAiStatus();
  const { data, isLoading } = useInventoryInsights(!!status?.configured);

  if (!status?.configured) return null;

  return (
    <section className="space-y-3 rounded-brand border-2 border-secondary bg-white p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
        <AlertTriangle size={18} className="text-accent" />
        Cảnh báo tồn kho (AI)
      </h2>
      {isLoading ? (
        <div className="h-16 animate-pulse rounded-lg bg-secondary/50" />
      ) : (
        <p className="whitespace-pre-line text-sm text-foreground/80">{data?.summary}</p>
      )}
    </section>
  );
}
