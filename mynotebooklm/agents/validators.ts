import {
  QuizSchema,
  type Quiz,
  FlashcardSchema,
  type Flashcard,
} from "./schemas";
import { ZodError } from "zod";

export interface ValidationResult<T = Quiz | Flashcard> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export function validateQuiz(rawData: unknown): ValidationResult<Quiz> {
  try {
    const validated = QuizSchema.parse(rawData);

    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((err) => {
        const path = err.path.join(".");
        return `${path}: ${err.message}`;
      });

      return {
        success: false,
        errors,
      };
    }

    return {
      success: false,
      errors: ["Unknown validation error"],
    };
  }
}

export function validateFlashcard(
  rawData: unknown,
): ValidationResult<Flashcard> {
  try {
    const validated = FlashcardSchema.parse(rawData);

    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((err) => {
        const path = err.path.join(".");
        return `${path}: ${err.message}`;
      });

      return {
        success: false,
        errors,
      };
    }

    return {
      success: false,
      errors: ["Unknown validation error"],
    };
  }
}
