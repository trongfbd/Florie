import { HealthStatusCard } from "@/features/health/health-status-card";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-6 py-24 text-center">
      <div className="space-y-3">
        <span className="inline-block rounded-full bg-primary px-4 py-1 text-xs font-semibold tracking-wide text-foreground">
          Sprint 0 — Nền tảng dự án
        </span>
        <h1 className="font-display text-4xl font-semibold text-foreground">
          Florie
        </h1>
        <p className="text-foreground/70">Mỗi bó hoa, một câu chuyện.</p>
      </div>

      <HealthStatusCard />
    </div>
  );
}
