export function formatTime(time: string, use24Hour = false): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const m = minutes;

  if (use24Hour) {
    return `${hours}:${m}`;
  }

  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m} ${ampm}`;
}
