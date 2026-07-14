import type { MaterialType } from "@/features/admin-materials/types";

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  FLOWER: "Hoa",
  PAPER: "Giấy",
  RIBBON: "Ruy băng",
  FOAM: "Mút",
  BASKET: "Giỏ",
  ARRANGEMENT_BOX: "Lẵng",
  CARD: "Thiệp",
  CHOCOLATE: "Chocolate",
  TEDDY_BEAR: "Gấu bông",
  SCENTED_CANDLE: "Nến thơm",
  OTHER: "Khác",
};

export const MATERIAL_TYPE_OPTIONS = Object.keys(MATERIAL_TYPE_LABELS) as MaterialType[];
