export function StatTile({
  label,
  value,
  tone = "default",
  hint,
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
  hint?: string;
}) {
  const valueColor =
    tone === "positive" ? "text-success" : tone === "negative" ? "text-destructive" : "text-heading";

  return (
    <div className="rounded-brand border-2 border-secondary bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">{label}</p>
      <p className={`mt-1.5 font-display text-2xl font-bold ${valueColor}`}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-foreground/40">{hint}</p>}
    </div>
  );
}
