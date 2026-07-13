import { adminApiClient } from "@/lib/admin-api-client";
import type {
  AiStatus,
  ChatMessageInput,
  ChatReplyResult,
  GenerateContentInput,
  GenerateContentResult,
  InventoryInsightsResult,
} from "./types";

export async function fetchAiStatus(): Promise<AiStatus> {
  const { data } = await adminApiClient.get<AiStatus>("/api/v1/ai/status");
  return data;
}

export async function generateContent(input: GenerateContentInput): Promise<GenerateContentResult> {
  const { data } = await adminApiClient.post<GenerateContentResult>("/api/v1/ai/generate-content", input);
  return data;
}

export async function askSalesAssistant(input: ChatMessageInput): Promise<ChatReplyResult> {
  const { data } = await adminApiClient.post<ChatReplyResult>("/api/v1/ai/sales-assistant", input);
  return data;
}

export async function askDashboardQa(input: ChatMessageInput): Promise<ChatReplyResult> {
  const { data } = await adminApiClient.post<ChatReplyResult>("/api/v1/ai/dashboard-qa", input);
  return data;
}

export async function fetchInventoryInsights(): Promise<InventoryInsightsResult> {
  const { data } = await adminApiClient.get<InventoryInsightsResult>("/api/v1/ai/inventory-insights");
  return data;
}
