export function generateId(): string {
  return `alarm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function formatTwoDigit(n: number): string {
  return n.toString().padStart(2, "0");
}
