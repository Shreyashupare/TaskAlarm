import type { CustomQuestion } from "../../../../constants/types";

/**
 * My Questions Screen Utilities
 * Helper functions for question manipulation
 */

// Truncate question for preview display
export function truncateQuestion(text: string, maxLength = 40): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

// Format option count label
export function getOptionCountLabel(count: number): string {
  return count === 1 ? "1 option" : `${count} options`;
}

// Clone a question for editing
export function cloneQuestion(question: CustomQuestion): CustomQuestion {
  return {
    id: question.id,
    question: question.question,
    options: [...question.options],
    correctAnswer: question.correctAnswer,
  };
}

// Check if two questions are equal (for dirty state)
export function areQuestionsEqual(a: CustomQuestion, b: CustomQuestion): boolean {
  return (
    a.id === b.id &&
    a.question === b.question &&
    a.correctAnswer === b.correctAnswer &&
    a.options.length === b.options.length &&
    a.options.every((opt, i) => opt === b.options[i])
  );
}
