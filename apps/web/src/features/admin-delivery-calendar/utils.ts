const DAY_MS = 24 * 60 * 60 * 1000;

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function toIsoDate(date: Date): string {
  return dateKey(date);
}

/** Mon-start 6-week grid covering the given month, plus overflow days from adjacent months. */
export function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, i) => new Date(gridStart.getTime() + i * DAY_MS));
}

export const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export const MONTH_LABEL = (year: number, month: number) =>
  `Tháng ${month + 1}/${year}`;
