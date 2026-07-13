import { Zap } from "lucide-react";
import { CountdownTimer } from "./countdown-timer";
import { FlashSaleGrid } from "./flash-sale-grid";
import type { FlashSale } from "../types";

export function FlashSaleSection({ flashSale }: { flashSale: FlashSale }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-brand bg-gradient-to-r from-accent to-destructive px-6 py-5">
        <div className="flex items-center gap-2 text-white">
          <Zap size={24} className="fill-white" />
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{flashSale.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white/90">Kết thúc sau</span>
          <CountdownTimer endAt={flashSale.endAt} />
        </div>
      </div>
      <FlashSaleGrid items={flashSale.items} />
    </section>
  );
}
