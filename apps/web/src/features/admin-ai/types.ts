export type GenerateContentType = "PRODUCT_DESCRIPTION" | "BLOG_POST";

export interface GenerateContentInput {
  contentType: GenerateContentType;
  topic: string;
  keywords?: string;
}

export interface GenerateContentResult {
  content: string;
}

export interface ChatMessageInput {
  message: string;
}

export interface ChatReplyResult {
  reply: string;
}

export interface InventoryInsightsResult {
  summary: string;
  lowStockCount: number;
}

export interface AiStatus {
  configured: boolean;
}
