"use client";

import { useHealthQuery } from "./queries";

export function HealthStatusCard() {
  const { data, isLoading, isError, error } = useHealthQuery();

  return (
    <div className="w-full max-w-md rounded-brand border border-primary bg-secondary p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
        System Status
      </h2>

      {isLoading && (
        <div className="mt-3 animate-pulse space-y-2">
          <div className="h-4 w-2/3 rounded bg-white/60" />
          <div className="h-4 w-1/2 rounded bg-white/60" />
        </div>
      )}

      {isError && (
        <p className="mt-3 text-sm text-destructive">
          Không kết nối được API: {(error as Error).message}
        </p>
      )}

      {data && (
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-foreground/70">API</dt>
            <dd className="font-medium text-success">
              {data.status === "ok" ? "Đang hoạt động" : "Lỗi"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-foreground/70">Database</dt>
            <dd
              className={
                data.database === "connected"
                  ? "font-medium text-success"
                  : "font-medium text-destructive"
              }
            >
              {data.database === "connected" ? "Đã kết nối" : "Mất kết nối"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-foreground/70">Cập nhật lúc</dt>
            <dd>{new Date(data.timestamp).toLocaleTimeString("vi-VN")}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
