export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  service: string;
  database: "connected" | "disconnected";
}
