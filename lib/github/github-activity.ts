import type { Contribution } from "./github";

const DAY_MS = 86_400_000;

export type CalendarDayStatus = "past" | "today" | "future" | "outside";

export interface CalendarDay {
  date: string;
  count: number | null;
  inRange: boolean;
  status: CalendarDayStatus;
}

/** Build complete Sunday-first weeks from Nov 28 of the previous calendar year
 *  to Dec 31 of the current calendar year.
 */
export function buildActivityCalendar(
  data: Contribution[],
  today: string = new Date().toISOString().slice(0, 10),
) {
  if (data.length === 0) return null;

  const byDate = new Map<string, number>();
  for (const { date, count } of data) {
    const timestamp = Date.parse(`${date}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(timestamp) ||
      new Date(timestamp).toISOString().slice(0, 10) !== date ||
      !Number.isSafeInteger(count) ||
      count < 0 ||
      byDate.has(date)
    ) {
      throw new Error(`Invalid GitHub contribution for ${date}`);
    }
    byDate.set(date, count);
  }

  // Window: Nov 28 of previous calendar year to Dec 31 of current calendar year.
  const currentYear = new Date(today).getUTCFullYear();
  const start = `${currentYear - 1}-11-28`;
  const end = `${currentYear}-12-31`;

  const first = Date.parse(`${start}T00:00:00Z`);
  const last = Date.parse(`${end}T00:00:00Z`);
  const firstIndex = new Date(first).getUTCDay();
  const lastIndex = firstIndex + Math.round((last - first) / DAY_MS);
  const weekCount = Math.ceil((lastIndex + 1) / 7);
  const gridStart = first - firstIndex * DAY_MS;
  const days: CalendarDay[] = Array.from({ length: weekCount * 7 }, (_, index) => {
    const date = new Date(gridStart + index * DAY_MS)
      .toISOString()
      .slice(0, 10);
    return {
      date,
      count: byDate.get(date) ?? null,
      inRange: index >= firstIndex && index <= lastIndex,
      status: date < today ? "past" : date > today ? "future" : "today",
    };
  });
  const months: { date: string; column: number }[] = [];
  for (let index = firstIndex; index <= lastIndex; index++) {
    const date = days[index].date;
    if (index === firstIndex || date.endsWith("-01")) {
      const column = Math.floor(index / 7);
      // A short opening month must not collide with the next month's label.
      if (months.length && column - months[months.length - 1].column < 3) {
        months.pop();
      }
      months.push({ date, column });
    }
  }

  return { start, end, firstIndex, lastIndex, weekCount, days, months };
}

export type ActivityCalendar = NonNullable<
  ReturnType<typeof buildActivityCalendar>
>;

export function activityColor(count: number) {
  return `var(--heatmap-level-${Math.min(count, 4)})`;
}
