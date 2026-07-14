import { Star, Users, PackageCheck } from "lucide-react";
import type { StorefrontStats } from "../types";

function formatCompact(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k+`;
  return `${value}`;
}

export function SocialProofStats({ stats }: { stats: StorefrontStats }) {
  const hasData = stats.totalCustomers > 0 || stats.totalCompletedOrders > 0 || stats.totalReviews > 0;
  if (!hasData) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
      {stats.totalCustomers > 0 && (
        <div className="flex items-center gap-2.5">
          <Users size={20} className="text-accent" />
          <div className="text-left">
            <p className="font-display text-xl font-bold text-heading">{formatCompact(stats.totalCustomers)}</p>
            <p className="text-xs text-foreground/60">Khách hàng tin chọn</p>
          </div>
        </div>
      )}
      {stats.totalCompletedOrders > 0 && (
        <div className="flex items-center gap-2.5">
          <PackageCheck size={20} className="text-accent" />
          <div className="text-left">
            <p className="font-display text-xl font-bold text-heading">{formatCompact(stats.totalCompletedOrders)}</p>
            <p className="text-xs text-foreground/60">Đơn hàng đã giao</p>
          </div>
        </div>
      )}
      {stats.totalReviews > 0 && (
        <div className="flex items-center gap-2.5">
          <Star size={20} className="fill-accent text-accent" />
          <div className="text-left">
            <p className="font-display text-xl font-bold text-heading">{stats.avgRating.toFixed(1)}/5</p>
            <p className="text-xs text-foreground/60">{stats.totalReviews} đánh giá</p>
          </div>
        </div>
      )}
    </div>
  );
}
