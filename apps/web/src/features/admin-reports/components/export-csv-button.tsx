"use client";

import { Download } from "lucide-react";
import { downloadCsv, rowsToCsv } from "@/lib/csv";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/expense-category-labels";
import { ORDER_STATUS_LABELS } from "@/features/order-tracking/status-labels";
import {
  useExpensesByCategory,
  useOrderStatusBreakdown,
  useReportSummary,
  useRevenueSeries,
  useTopProducts,
} from "../hooks";

export function ExportCsvButton() {
  const { data: summary } = useReportSummary();
  const { data: revenueSeries } = useRevenueSeries();
  const { data: expenses } = useExpensesByCategory();
  const { data: topProducts } = useTopProducts();
  const { data: orderStatus } = useOrderStatusBreakdown();

  const isReady = !!summary && !!revenueSeries && !!expenses && !!topProducts && !!orderStatus;

  function handleExport() {
    if (!summary || !revenueSeries || !expenses || !topProducts || !orderStatus) return;

    const rows: (string | number)[][] = [];
    const fromDate = summary.from.slice(0, 10);
    const toDate = summary.to.slice(0, 10);

    rows.push(["Báo cáo Florie", `${fromDate} → ${toDate}`]);
    rows.push([]);

    rows.push(["TỔNG QUAN"]);
    rows.push(["Doanh thu", summary.revenue]);
    rows.push(["Giá vốn hàng bán", summary.cogs]);
    rows.push(["Lợi nhuận gộp", summary.grossProfit]);
    rows.push(["Chi phí", summary.totalExpenses]);
    rows.push(["Lợi nhuận", summary.netProfit]);
    rows.push(["Đơn hoàn thành", `${summary.completedOrderCount}/${summary.orderCount}`]);
    rows.push(["Đơn đã hủy", summary.cancelledOrderCount]);
    rows.push(["Giá trị đơn trung bình", summary.avgOrderValue]);
    rows.push(["Khách hàng mới", summary.newCustomerCount]);
    rows.push([]);

    rows.push(["DOANH THU THEO NGÀY"]);
    rows.push(["Ngày", "Doanh thu", "Số đơn"]);
    revenueSeries.forEach((point) => rows.push([point.date, point.revenue, point.orderCount]));
    rows.push([]);

    rows.push(["CHI PHÍ THEO HẠNG MỤC"]);
    rows.push(["Hạng mục", "Tổng tiền"]);
    expenses.byCategory.forEach((item) =>
      rows.push([EXPENSE_CATEGORY_LABELS[item.category] ?? item.category, item.total]),
    );
    rows.push([]);

    rows.push(["SẢN PHẨM BÁN CHẠY"]);
    rows.push(["Sản phẩm", "SL đã bán", "Doanh thu"]);
    topProducts.forEach((product) => rows.push([product.name, product.quantitySold, product.revenue]));
    rows.push([]);

    rows.push(["ĐƠN HÀNG THEO TRẠNG THÁI"]);
    rows.push(["Trạng thái", "Số lượng"]);
    Object.entries(orderStatus).forEach(([status, count]) =>
      rows.push([ORDER_STATUS_LABELS[status] ?? status, count]),
    );

    downloadCsv(`florie-bao-cao-${fromDate}_${toDate}.csv`, rowsToCsv(rows));
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={!isReady}
      className="flex items-center gap-2 rounded-full border-2 border-secondary px-4 py-2 text-sm font-semibold text-heading transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50"
    >
      <Download size={16} />
      Xuất CSV
    </button>
  );
}
