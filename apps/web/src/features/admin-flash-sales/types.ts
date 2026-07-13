export interface FlashSaleItem {
  id: string;
  productId: string;
  salePrice: number;
  quantityLimit: number | null;
  soldQuantity: number;
  product: { id: string; name: string; basePrice: number };
}

export interface FlashSale {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  isActive: boolean;
  items: FlashSaleItem[];
}

export interface FlashSaleItemInput {
  productId: string;
  salePrice: number;
  quantityLimit?: number;
}

export interface FlashSaleFormInput {
  name: string;
  startAt: string;
  endAt: string;
  isActive?: boolean;
  items: FlashSaleItemInput[];
}

export interface PaginatedFlashSales {
  data: FlashSale[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
