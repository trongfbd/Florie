import type { RevenueGroupBy } from '../dto/revenue-series-query.dto';

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/** Monday of the ISO week containing `date`. */
function startOfIsoWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day; // shift Sunday(0) back to the previous Monday
  result.setDate(result.getDate() + diff);
  return result;
}

/** Buckets `date` into a sortable, human-readable string key per `groupBy`. */
export function bucketKey(date: Date, groupBy: RevenueGroupBy): string {
  if (groupBy === 'month') {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  }
  if (groupBy === 'week') {
    const monday = startOfIsoWeek(date);
    return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
