import type { Quote } from "./types";

export const DEFAULT_QUOTES: Omit<Quote, "id">[] = [
  { text: "The early morning has gold in its mouth.", author: "Benjamin Franklin", active: true },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier", active: true },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi", active: true },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki", active: true },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "George Lorimer", active: true },
  { text: "Every morning brings new potential.", author: "Unknown", active: true },
  { text: "Rise up, start fresh, see the bright opportunity in each day.", author: "Unknown", active: true },
];
