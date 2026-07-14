"use client";

import { formatVnd } from "@/lib/format";
import { StatTile } from "@/components/admin/stat-tile";
import { DashboardQaWidget } from "@/features/admin-ai/components/dashboard-qa-widget";
import { InventoryInsightsCard } from "@/features/admin-ai/components/inventory-insights-card";
import { useReportSummary } from "../hooks";
import { RevenueChart } from "./revenue-chart";
import { ExpenseBreakdown } from "./expense-breakdown";
import { OrderStatusSummary } from "./order-status-summary";
import { TopProductsList } from "./top-products-list";
import { ExportCsvButton } from "./export-csv-button";

function costPriceCoverageHint(coverage: number | null): string | undefined {
  if (coverage === null || coverage >= 1) return undefined;
  return `Chỉ ${Math.round(coverage * 100)}% sản phẩm trong kỳ có giá vốn — số liệu chưa đầy đủ`;
}

export function DashboardContent() {
  const { data: summary, isLoading } = useReportSummary();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-heading">Tổng quan</h1>
          <p className="mt-1 text-sm text-foreground/60">30 ngày gần nhất</p>
        </div>
        <ExportCsvButton />
      </div>

      {isLoading || !summary ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-brand bg-secondary/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatTile label="Doanh thu" value={formatVnd(summary.revenue)} />
          <StatTile label="Giá vốn hàng bán" value={formatVnd(summary.cogs)} tone="negative" hint={costPriceCoverageHint(summary.costPriceCoverage)} />
          <StatTile label="Chi phí" value={formatVnd(summary.totalExpenses)} tone="negative" />
          <StatTile
            label="Lợi nhuận"
            value={formatVnd(summary.netProfit)}
            tone={summary.netProfit >= 0 ? "positive" : "negative"}
          />
          <StatTile label="Đơn hoàn thành" value={`${summary.completedOrderCount}/${summary.orderCount}`} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 rounded-brand border-2 border-secondary bg-white p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-heading">Doanh thu theo ngày</h2>
          <RevenueChart />
        </section>

        <section className="space-y-4 rounded-brand border-2 border-secondary bg-white p-5">
          <h2 className="font-display text-lg font-bold text-heading">Đơn hàng theo trạng thái</h2>
          <OrderStatusSummary />
        </section>

        <section className="space-y-4 rounded-brand border-2 border-secondary bg-white p-5">
          <h2 className="font-display text-lg font-bold text-heading">Chi phí theo hạng mục</h2>
          <ExpenseBreakdown />
        </section>

        <section className="space-y-1 rounded-brand border-2 border-secondary bg-white p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-heading">Sản phẩm bán chạy</h2>
          <TopProductsList />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardQaWidget />
        <InventoryInsightsCard />
      </div>
    </div>
  );
}
