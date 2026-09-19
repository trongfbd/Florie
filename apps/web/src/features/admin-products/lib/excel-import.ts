import * as XLSX from "xlsx";
import type { Category } from "@/features/admin-categories/types";
import type { ProductFormInput, ProductStatus } from "../types";

// Column headers — must match what generateTemplate() writes, since
// parseWorkbook() reads rows back keyed by these exact header strings.
const COLUMNS = {
  name: "Tên sản phẩm",
  category: "Danh mục",
  basePrice: "Giá gốc",
  salePrice: "Giá khuyến mãi",
  costPrice: "Giá vốn",
  color: "Màu sắc",
  description: "Mô tả",
  status: "Trạng thái",
} as const;

const STATUS_TEXT_TO_ENUM: Record<string, ProductStatus> = {
  "nháp": "DRAFT",
  "đang bán": "ACTIVE",
  "hết hàng": "OUT_OF_STOCK",
  "ngừng kinh doanh": "ARCHIVED",
};

export interface ParsedProductRow {
  rowNumber: number; // 1-based, matches the row a user sees in Excel (header = row 1)
  input: ProductFormInput | null; // null when invalid — see `error`
  error: string | null;
  preview: { name: string; category: string; basePrice: string };
}

export function generateTemplate(): void {
  const headers = Object.values(COLUMNS);
  const example = [
    "Bó hoa hồng đỏ",
    "Hoa sinh nhật",
    "350000",
    "290000",
    "150000",
    "Đỏ",
    "Bó hoa hồng đỏ tươi, phù hợp tặng sinh nhật",
    "Đang bán",
  ];
  const sheet = XLSX.utils.aoa_to_sheet([headers, example]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Sản phẩm");
  XLSX.writeFile(workbook, "mau-nhap-san-pham.xlsx");
}

function parseNumber(value: unknown): number | undefined {
  if (value === "" || value === undefined || value === null) return undefined;
  const n = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

export async function parseWorkbook(file: File, categories: Category[]): Promise<ParsedProductRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  const categoryByName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c.id]));

  return rows.map((row, index) => {
    const rowNumber = index + 2; // +1 for header row, +1 for 1-based
    const name = String(row[COLUMNS.name] ?? "").trim();
    const categoryName = String(row[COLUMNS.category] ?? "").trim();
    const basePrice = parseNumber(row[COLUMNS.basePrice]);
    const preview = { name, category: categoryName, basePrice: row[COLUMNS.basePrice] ? String(row[COLUMNS.basePrice]) : "" };

    if (!name) {
      return { rowNumber, input: null, error: "Thiếu tên sản phẩm", preview };
    }
    if (!categoryName) {
      return { rowNumber, input: null, error: "Thiếu danh mục", preview };
    }
    const categoryId = categoryByName.get(categoryName.toLowerCase());
    if (!categoryId) {
      return { rowNumber, input: null, error: `Không tìm thấy danh mục "${categoryName}"`, preview };
    }
    if (basePrice === undefined) {
      return { rowNumber, input: null, error: "Giá gốc không hợp lệ", preview };
    }

    const statusText = String(row[COLUMNS.status] ?? "").trim().toLowerCase();
    const status = statusText ? STATUS_TEXT_TO_ENUM[statusText] : undefined;
    if (statusText && !status) {
      return {
        rowNumber,
        input: null,
        error: `Trạng thái "${row[COLUMNS.status]}" không hợp lệ (Nháp / Đang bán / Hết hàng / Ngừng kinh doanh)`,
        preview,
      };
    }

    const input: ProductFormInput = {
      name,
      categoryId,
      basePrice,
      salePrice: parseNumber(row[COLUMNS.salePrice]),
      costPrice: parseNumber(row[COLUMNS.costPrice]),
      color: String(row[COLUMNS.color] ?? "").trim() || undefined,
      description: String(row[COLUMNS.description] ?? "").trim() || undefined,
      status: status ?? "DRAFT",
    };

    return { rowNumber, input, error: null, preview };
  });
}
