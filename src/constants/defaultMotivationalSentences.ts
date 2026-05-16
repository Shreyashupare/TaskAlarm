import {
  MOTIVATIONAL_SENTENCE_COUNT_MAX,
  MOTIVATIONAL_SENTENCE_COUNT_MIN,
} from "./AppConstants";

export const DEFAULT_MOTIVATIONAL_SENTENCES = [
  "I'm the best.",
  "I can do it alone.",
  "God is always with me.",
  "I am a winner.",
  "Today is my day.",
  "I believe in myself.",
  "Every challenge makes me stronger.",
  "I am capable of achieving anything.",
  "My potential is limitless.",
  "I choose happiness and success.",
  "I am in control of my destiny.",
  "Today I will shine.",
  "I am grateful for this moment.",
  "I embrace new opportunities.",
  "I am worthy of love and respect.",
  "I trust my instincts.",
  "I am creating my future.",
  "I am focused and determined.",
  "I radiate positivity.",
  "I am unstoppable.",
] as const;

export function getRandomMotivationalSentenceCount(): number {
  const range = MOTIVATIONAL_SENTENCE_COUNT_MAX - MOTIVATIONAL_SENTENCE_COUNT_MIN + 1;
  return MOTIVATIONAL_SENTENCE_COUNT_MIN + Math.floor(Math.random() * range);
}

export function getRandomMotivationalSentences(count?: number): string[] {
  const n = count ?? getRandomMotivationalSentenceCount();
  const shuffled = [...DEFAULT_MOTIVATIONAL_SENTENCES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
