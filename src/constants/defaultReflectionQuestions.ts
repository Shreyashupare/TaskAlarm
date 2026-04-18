/**
 * Default reflection questions that rotate when reflection task is enabled.
 * Each question prompts the user for a brief morning reflection.
 */

export const DEFAULT_REFLECTION_QUESTIONS = [
  "What's your goal for today?",
  "What do you want to achieve in life?",
  "Are you on the right track?",
  "What are you grateful for?",
  "What's one thing you want to improve today?",
  "What did you do yesterday that you're proud of?",
  "What's one decision you've been avoiding?",
  "What does progress look like for you today?",
  "What's draining your energy right now?",
  "What's one small win you can celebrate this evening?",
  "How are you investing in yourself this week?",
  "What habits are helping you move forward?",
  "What habits are secretly holding you back?",
  "What would your future self thank you for doing today?",
  "What's the next step you need to take toward your biggest goal?",
  "When did you feel most focused recently, and why?",
  "What's one fear you need to confront this week?",
  "Are your actions aligned with your long‑term values?",
  "What can you say no to, so you can say yes to what matters?",
  "What would a fully committed version of you do today?",
] as const;

export type ReflectionQuestion = typeof DEFAULT_REFLECTION_QUESTIONS[number];

/**
 * Get a reflection question based on index (rotates through the list)
 * Or get a random question if no index provided
 */
export function getReflectionQuestion(index?: number): ReflectionQuestion {
  // Use random question for variety
  const randomIndex = Math.floor(Math.random() * DEFAULT_REFLECTION_QUESTIONS.length);
  return DEFAULT_REFLECTION_QUESTIONS[randomIndex];
}

/**
 * Total number of available reflection questions
 */
export const REFLECTION_QUESTION_COUNT = DEFAULT_REFLECTION_QUESTIONS.length;
