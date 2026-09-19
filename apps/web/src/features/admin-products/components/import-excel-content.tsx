"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { useCategories } from "@/features/admin-categories/hooks";
import { getErrorMessage } from "@/lib/get-error-message";
import { createProduct } from "../api";
import { generateTemplate, parseWorkbook, type ParsedProductRow } from "../lib/excel-import";

type ImportRowResult = ParsedProductRow & { status: "pending" | "done" | "failed"; resultMessage?: string };

export function ImportExcelContent() {
  const { data: categoriesData } = useCategories();
  const [rows, setRows] = useState<ImportRowResult[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setFileError(null);
    setRows(null);
    try {
      const parsed = await parseWorkbook(file, categoriesData?.data ?? []);
      if (parsed.length === 0) {
        setFileError("File không có dữ liệu — kiểm tra lại có đúng theo mẫu không.");
        return;
      }
      setRows(parsed.map((row) => ({ ...row, status: "pending" as const })));
    } catch {
      setFileError("Không đọc được file — hãy chắc chắn đây là file .xlsx đúng theo mẫu.");
    }
  }

  const validCount = rows?.filter((r) => r.input).length ?? 0;

  async function handleImport() {
    if (!rows) return;
    setIsImporting(true);

    // Sequential on purpose — this is an admin-only, low-frequency action,
    // and sequential keeps per-row progress simple to show and avoids
    // hammering the API with a burst of parallel writes.
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.input) continue;
      try {
        await createProduct(row.input);
        setRows((prev) => prev?.map((r, idx) => (idx === i ? { ...r, status: "done" } : r)) ?? null);
      } catch (error) {
        setRows((prev) =>
          prev?.map((r, idx) =>
            idx === i ? { ...r, status: "failed", resultMessage: getErrorMessage(error, "Lỗi không xác định") } : r,
          ) ?? null,
        );
      }
    }
    setIsImporting(false);
  }

  const doneCount = rows?.filter((r) => r.status === "done").length ?? 0;
  const failedCount = rows?.filter((r) => r.status === "failed").length ?? 0;
  const finished = rows !== null && !isImporting && doneCount + failedCount === validCount && validCount > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-brand border-2 border-secondary bg-white p-5">
        <button
          type="button"
          onClick={generateTemplate}
          className="flex items-center gap-2 rounded-full border-2 border-secondary px-4 py-2 text-sm font-semibold text-heading transition-colors hover:bg-secondary"
        >
          <Download size={16} />
          Tải file mẫu
        </button>

        <label className="flex cursor-pointer items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-white shadow-md shadow-accent/30 transition-transform hover:scale-105">
          <Upload size={16} />
          Chọn file Excel
          <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
        </label>

        <p className="text-xs text-foreground/50">
          Cột &quot;Danh mục&quot; phải khớp đúng tên danh mục đã có sẵn. Ảnh sản phẩm thêm sau ở trang sửa từng sản phẩm.
        </p>
      </div>

      {fileError && <p className="text-sm text-destructive">{fileError}</p>}

      {rows && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/70">
              {rows.length} dòng — <span className="font-semibold text-success">{validCount} hợp lệ</span>,{" "}
              <span className="font-semibold text-destructive">{rows.length - validCount} lỗi</span>
            </p>
            {!finished && (
              <button
                type="button"
                disabled={validCount === 0 || isImporting}
                onClick={handleImport}
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105 disabled:opacity-60"
              >
                {isImporting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Đang nhập {doneCount + failedCount}/{validCount}...
                  </span>
                ) : (
                  `Nhập ${validCount} sản phẩm hợp lệ`
                )}
              </button>
            )}
          </div>

          {finished && (
            <div className="rounded-brand border-2 border-success/40 bg-success/10 p-4 text-sm">
              <p className="font-semibold text-heading">
                Hoàn tất: {doneCount} sản phẩm đã thêm thành công, {failedCount} lỗi.
              </p>
              <Link href="/admin/san-pham" className="mt-1 inline-block font-semibold text-accent hover:underline">
                Về danh sách sản phẩm →
              </Link>
            </div>
          )}

          <div className="overflow-x-auto rounded-brand border-2 border-secondary bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-secondary bg-secondary/30 text-left text-xs font-semibold uppercase text-foreground/60">
                <tr>
                  <th className="px-4 py-3">Dòng</th>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Danh mục</th>
                  <th className="px-4 py-3">Giá gốc</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary">
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-foreground/50">{row.rowNumber}</td>
                    <td className="px-4 py-2">{row.preview.name || "—"}</td>
                    <td className="px-4 py-2">{row.preview.category || "—"}</td>
                    <td className="px-4 py-2">{row.preview.basePrice || "—"}</td>
                    <td className="px-4 py-2">
                      {row.status === "done" && <span className="font-semibold text-success">✓ Đã thêm</span>}
                      {row.status === "failed" && (
                        <span className="font-semibold text-destructive">✗ {row.resultMessage}</span>
                      )}
                      {row.status === "pending" && row.error && (
                        <span className="font-semibold text-destructive">✗ {row.error}</span>
                      )}
                      {row.status === "pending" && !row.error && (
                        <span className="font-semibold text-foreground/50">Chờ nhập</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
