import type { CustomQuestion } from "../../../../constants/types";

/**
 * My Questions Screen Constants
 * Following coding standards: separate constants from implementation
 */

// Maximum limits for custom questions
export const MAX_QUESTIONS = 100;
export const MAX_OPTIONS = 4;
export const MIN_OPTIONS = 2;

// Character limits (80 for questions, 20 for options - 20% reduced from spec)
export const MAX_QUESTION_LENGTH = 80;
export const MAX_OPTION_LENGTH = 20;

// Helper to generate unique question ID
export function generateQuestionId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Validate a custom question
export function validateQuestion(question: CustomQuestion): {
  isValid: boolean;
  error?: string;
} {
  // Check question text
  if (!question.question || question.question.trim().length === 0) {
    return { isValid: false, error: "Question is required" };
  }
  if (question.question.length > MAX_QUESTION_LENGTH) {
    return {
      isValid: false,
      error: `Question must be ${MAX_QUESTION_LENGTH} characters or less`,
    };
  }

  // Check options count
  if (question.options.length < MIN_OPTIONS) {
    return { isValid: false, error: `At least ${MIN_OPTIONS} options required` };
  }
  if (question.options.length > MAX_OPTIONS) {
    return {
      isValid: false,
      error: `Maximum ${MAX_OPTIONS} options allowed`,
    };
  }

  // Check each option
  for (const option of question.options) {
    if (!option || option.trim().length === 0) {
      return { isValid: false, error: "All options must be filled" };
    }
    if (option.length > MAX_OPTION_LENGTH) {
      return {
        isValid: false,
        error: `Options must be ${MAX_OPTION_LENGTH} characters or less`,
      };
    }
  }

  // Check for duplicate options
  const uniqueOptions = new Set(question.options.map(o => o.toLowerCase().trim()));
  if (uniqueOptions.size !== question.options.length) {
    return { isValid: false, error: "Options must be unique" };
  }

  // Check correct answer
  if (!question.correctAnswer || !question.options.includes(question.correctAnswer)) {
    return { isValid: false, error: "Correct answer must be one of the options" };
  }

  return { isValid: true };
}

// Create empty question template
export function createEmptyQuestion(): CustomQuestion {
  return {
    id: generateQuestionId(),
    question: "",
    options: ["", ""], // Start with 2 empty options
    correctAnswer: "",
  };
}
