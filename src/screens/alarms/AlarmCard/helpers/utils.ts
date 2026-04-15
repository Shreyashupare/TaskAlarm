export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const m = minutes;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m} ${ampm}`;
}

export function formatWeekdays(weekdays: number[]): string {
  if (weekdays.length === 0) return "One-time";
  if (weekdays.length === 7) return "Every day";
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  return weekdays.map(d => days[d]).join(" ");
}
