export type MaterialType =
  | "FLOWER"
  | "PAPER"
  | "RIBBON"
  | "FOAM"
  | "BASKET"
  | "ARRANGEMENT_BOX"
  | "CARD"
  | "CHOCOLATE"
  | "TEDDY_BEAR"
  | "SCENTED_CANDLE"
  | "OTHER";

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  unit: string;
  // Prisma Decimal fields serialize as strings over JSON (avoids float precision loss).
  stockQuantity: string;
  minStockThreshold: string;
  latestCostPrice: number;
  supplierId: string | null;
  supplier: { id: string; name: string } | null;
  isActive: boolean;
  createdAt: string;
}

export interface MaterialFormInput {
  name: string;
  type: MaterialType;
  unit: string;
  minStockThreshold?: number;
  supplierId?: string;
  isActive?: boolean;
}

export interface ImportStockInput {
  quantity: number;
  unitCost: number;
  supplierId?: string;
  note?: string;
}

export interface PaginatedMaterials {
  data: Material[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
