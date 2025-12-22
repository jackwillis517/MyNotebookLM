// lib/schemas/quiz.ts
import { z } from "zod";

export const QuizItemSchema = z.object({
  question: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .max(500, "Question must be less than 500 characters"),
  answers: z
    .array(z.string().min(1, "Answer cannot be empty"))
    .length(4, "Must have exactly 4 answers")
    .refine(
      (answers) => new Set(answers).size === 4,
      "All answers must be unique",
    ),
  answer: z
    .number()
    .int()
    .min(0, "Answer index must be at least 0")
    .max(3, "Answer index must be at most 3"),
});

export const QuizSchema = z
  .record(
    z
      .string()
      .regex(/^\d+$/, 'Key must be a numeric string like "1", "2", "3"'),
    QuizItemSchema,
  )
  .refine(
    (quiz) => Object.keys(quiz).length >= 1,
    "Quiz must have at least 1 question",
  )
  .refine((quiz) => {
    // Ensure keys are sequential starting from 1
    const keys = Object.keys(quiz)
      .map(Number)
      .sort((a, b) => a - b);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== i + 1) {
        return false;
      }
    }
    return true;
  }, "Question numbers must be sequential starting from 1");

export type Quiz = z.infer<typeof QuizSchema>;
export type QuizItem = z.infer<typeof QuizItemSchema>;

export const FlashcardItemSchema = z.object({
  question: z
    .string()
    .min(5, "Question must be at least 5 characters")
    .max(500, "Question must be less than 500 characters"),
  answer: z
    .string()
    .min(1, "Answer must be at least 1 character")
    .max(1000, "Answer must be less than 1000 characters"),
});

export const FlashcardSchema = z
  .record(
    z
      .string()
      .regex(/^\d+$/, 'Key must be a numeric string like "1", "2", "3"'),
    FlashcardItemSchema,
  )
  .refine(
    (flashcards) => Object.keys(flashcards).length >= 1,
    "Flashcard set must have at least 1 card",
  )
  .refine((flashcards) => {
    // Ensure keys are sequential starting from 1
    const keys = Object.keys(flashcards)
      .map(Number)
      .sort((a, b) => a - b);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== i + 1) {
        return false;
      }
    }
    return true;
  }, "Flashcard numbers must be sequential starting from 1");

export type Flashcard = z.infer<typeof FlashcardSchema>;
export type FlashcardItem = z.infer<typeof FlashcardItemSchema>;
