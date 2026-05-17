import { NIGHT_GUIDE_TIMEZONE } from "../constants/AppConstants";

/**
 * 09:00 IST in UTC hours/minutes (IST = UTC+5:30)
 */
const GRACE_DEADLINE_UTC_HOUR = 3;
const GRACE_DEADLINE_UTC_MINUTE = 30;

/**
 * Get date string in YYYY-MM-DD format for IST timezone.
 */
export function getIstDateString(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: NIGHT_GUIDE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const parts = new Intl.DateTimeFormat("en-CA", options).formatToParts(date);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${year}-${month}-${day}`;
}

/**
 * Get the current time in HH:MM (IST) for comparison.
 */
export function getIstTimeString(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: NIGHT_GUIDE_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

/**
 * Get today's weekday index (0=Sunday) in IST.
 */
export function getIstWeekday(date: Date = new Date()): number {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: NIGHT_GUIDE_TIMEZONE,
    weekday: "short",
  };
  const name = new Intl.DateTimeFormat("en-US", options).format(date);
  return WEEKDAY_INDEX[name] ?? 0;
}

/**
 * Calculate grace deadline as 09:00 IST next calendar day.
 * Returns epoch ms.
 */
export function getGraceDeadlineMs(scheduledDateYmd: string): number {
  const [year, month, day] = scheduledDateYmd.split("-").map(Number);
  // Next day at 09:00 IST = 03:30 UTC
  const deadline = new Date(
    Date.UTC(year, month - 1, day + 1, GRACE_DEADLINE_UTC_HOUR, GRACE_DEADLINE_UTC_MINUTE, 0, 0)
  );
  return deadline.getTime();
}

/**
 * Check if a grace deadline has passed.
 */
export function isPastGrace(deadlineMs: number, now?: Date): boolean {
  const currentTime = (now ?? new Date()).getTime();
  return currentTime >= deadlineMs;
}
