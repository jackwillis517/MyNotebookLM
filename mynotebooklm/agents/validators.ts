import { QuizSchema, type Quiz } from "./schemas";
import { ZodError } from "zod";

export interface ValidationResult {
  success: boolean;
  data?: Quiz;
  errors?: string[];
}

export function validateQuiz(rawData: unknown): ValidationResult {
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
