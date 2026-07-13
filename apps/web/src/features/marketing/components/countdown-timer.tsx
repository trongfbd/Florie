"use client";

import { useEffect, useState } from "react";

function getRemaining(endAt: string) {
  const diff = Math.max(0, new Date(endAt).getTime() - Date.now());
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    expired: diff <= 0,
  };
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function CountdownTimer({ endAt }: { endAt: string }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endAt));

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining(endAt)), 1000);
    return () => clearInterval(interval);
  }, [endAt]);

  if (remaining.expired) {
    return <span className="font-semibold text-foreground/60">Đã kết thúc</span>;
  }

  return (
    <div className="flex items-center gap-1.5 font-display text-lg font-bold tabular-nums text-white">
      <span className="rounded-lg bg-black/30 px-2 py-1">{pad(remaining.hours)}</span>:
      <span className="rounded-lg bg-black/30 px-2 py-1">{pad(remaining.minutes)}</span>:
      <span className="rounded-lg bg-black/30 px-2 py-1">{pad(remaining.seconds)}</span>
    </div>
  );
}
