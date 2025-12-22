import { createAgent, tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import * as z from "zod";
import {
  QUIZ_AGENT_SYSTEM_PROMPT,
  FLASHCARD_AGENT_SYSTEM_PROMPT,
  REPORT_AGENT_SYSTEM_PROMPT,
} from "./prompts";
import { validateQuiz, validateFlashcard } from "./validators";

// const model = new ChatOpenAI({
//   configuration: {
//     baseURL: "http://localhost:1234/v1",
//     apiKey: "lmstudio",
//   },
//   temperature: 0.5,
// });

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.5,
});

const quizAgent = createAgent({
  model: model,
  systemPrompt: QUIZ_AGENT_SYSTEM_PROMPT,
});

const flashcardAgent = createAgent({
  model: model,
  systemPrompt: FLASHCARD_AGENT_SYSTEM_PROMPT,
});

const reportAgent = createAgent({
  model: model,
  systemPrompt: REPORT_AGENT_SYSTEM_PROMPT,
});

export const callQuizAgent = tool(
  async ({ content }) => {
    console.log("Calling callQuizAgent");
    const result = await generateQuiz(content);
    return result;
  },
  {
    name: "call_quiz_agent",
    description: "Quiz subagent used to generate quizzes",
    schema: z.object({ content: z.string() }),
  },
);

export const callFlashcardAgent = tool(
  async ({ content }) => {
    console.log("Calling callFlashcardAgent");
    const result = await generateFlashcard(content);
    return result;
  },
  {
    name: "call_flashcard_agent",
    description: "Flashcard subagent used to generate flashcards",
    schema: z.object({ content: z.string() }),
  },
);

export const callReportAgent = tool(
  async ({ content }) => {
    console.log("Calling callReportAgent");
    const result = await generateReport(content);
    return result;
  },
  {
    name: "call_report_agent",
    description:
      "Report subagent used to generate formal executive reports from document content",
    schema: z.object({ content: z.string() }),
  },
);

const generateQuiz = async (content: string): Promise<string | undefined> => {
  const maxAttempts = 3;
  let lastError: string | undefined;
  let lastValidationErrors: string[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📝 Quiz generation attempt ${attempt}/${maxAttempts}`);

    try {
      // Invoke quiz agent
      const result = await quizAgent.invoke({
        messages: [{ role: "user", content: content }],
      });

      // Extract the last message content
      const lastMessage = result.messages[result.messages.length - 1];
      const quizContent = lastMessage.content as string;

      console.log(`📄 Raw quiz response (attempt ${attempt}):`, quizContent);

      // Clean up markdown if present
      const cleanedContent = quizContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // Parse JSON
      let parsedQuiz: unknown;
      try {
        parsedQuiz = JSON.parse(cleanedContent);
      } catch (parseError) {
        lastError = `Failed to parse JSON on attempt ${attempt}`;
        console.error(`❌ ${lastError}:`, parseError);

        // Add feedback for next attempt
        if (attempt < maxAttempts) {
          content = `${content}\n\nPrevious attempt failed: Invalid JSON format. Please ensure you output ONLY valid JSON with no markdown or extra text.`;
        }
        continue;
      }

      // Validate with Zod
      const validation = validateQuiz(parsedQuiz);

      if (validation.success) {
        console.log(`✅ Quiz validated successfully on attempt ${attempt}`);

        // Return formatted success message
        const questionCount = Object.keys(validation.data!).length;
        return JSON.stringify({
          success: true,
          message: `Successfully generated ${questionCount} quiz questions.`,
          quiz: validation.data,
        });
      } else {
        lastValidationErrors = validation.errors || [];
        lastError = `Validation failed on attempt ${attempt}`;
        console.error(`❌ ${lastError}:`, lastValidationErrors);

        // Add detailed feedback for next attempt
        if (attempt < maxAttempts) {
          const errorDetails = lastValidationErrors.join(", ");
          content = `${content}\n\nPrevious attempt had validation errors: ${errorDetails}. Please fix these issues and regenerate the quiz.`;
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Attempt ${attempt} failed:`, error);

      if (attempt < maxAttempts) {
        content = `${content}\n\nPrevious attempt failed with error: ${lastError}. Please try again.`;
      }
    }

    // Wait before retry (exponential backoff)
    if (attempt < maxAttempts) {
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  console.error(`❌ Quiz generation failed after ${maxAttempts} attempts`);

  return JSON.stringify({
    success: false,
    message: `Failed to generate valid quiz after ${maxAttempts} attempts. ${lastError || "Unknown error"}`,
    quiz: undefined,
  });
};

const generateFlashcard = async (
  content: string,
): Promise<string | undefined> => {
  const maxAttempts = 3;
  let lastError: string | undefined;
  let lastValidationErrors: string[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📇 Flashcard generation attempt ${attempt}/${maxAttempts}`);

    try {
      // Invoke flashcard agent
      const result = await flashcardAgent.invoke({
        messages: [{ role: "user", content: content }],
      });

      // Extract the last message content
      const lastMessage = result.messages[result.messages.length - 1];
      const flashcardContent = lastMessage.content as string;

      console.log(
        `📄 Raw flashcard response (attempt ${attempt}):`,
        flashcardContent,
      );

      // Clean up markdown if present
      const cleanedContent = flashcardContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // Parse JSON
      let parsedFlashcard: unknown;
      try {
        parsedFlashcard = JSON.parse(cleanedContent);
      } catch (parseError) {
        lastError = `Failed to parse JSON on attempt ${attempt}`;
        console.error(`❌ ${lastError}:`, parseError);

        // Add feedback for next attempt
        if (attempt < maxAttempts) {
          content = `${content}\n\nPrevious attempt failed: Invalid JSON format. Please ensure you output ONLY valid JSON with no markdown or extra text.`;
        }
        continue;
      }

      // Validate with Zod
      const validation = validateFlashcard(parsedFlashcard);

      if (validation.success) {
        console.log(
          `✅ Flashcard validated successfully on attempt ${attempt}`,
        );

        // Return formatted success message
        const cardCount = Object.keys(validation.data!).length;
        return JSON.stringify({
          success: true,
          message: `Successfully generated ${cardCount} flashcards.`,
          flashcards: validation.data,
        });
      } else {
        lastValidationErrors = validation.errors || [];
        lastError = `Validation failed on attempt ${attempt}`;
        console.error(`❌ ${lastError}:`, lastValidationErrors);

        // Add detailed feedback for next attempt
        if (attempt < maxAttempts) {
          const errorDetails = lastValidationErrors.join(", ");
          content = `${content}\n\nPrevious attempt had validation errors: ${errorDetails}. Please fix these issues and regenerate the flashcards.`;
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Attempt ${attempt} failed:`, error);

      if (attempt < maxAttempts) {
        content = `${content}\n\nPrevious attempt failed with error: ${lastError}. Please try again.`;
      }
    }

    // Wait before retry (exponential backoff)
    if (attempt < maxAttempts) {
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  console.error(`❌ Flashcard generation failed after ${maxAttempts} attempts`);

  return JSON.stringify({
    success: false,
    message: `Failed to generate valid flashcards after ${maxAttempts} attempts. ${lastError || "Unknown error"}`,
    flashcards: undefined,
  });
};

const generateReport = async (content: string): Promise<string | undefined> => {
  const maxAttempts = 3;
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📊 Report generation attempt ${attempt}/${maxAttempts}`);

    try {
      // Invoke report agent
      const result = await reportAgent.invoke({
        messages: [{ role: "user", content: content }],
      });

      // Extract the last message content
      const lastMessage = result.messages[result.messages.length - 1];
      const reportContent = lastMessage.content as string;

      console.log(`📄 Report generated successfully on attempt ${attempt}`);

      return reportContent;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Attempt ${attempt} failed:`, error);

      if (attempt < maxAttempts) {
        content = `${content}\n\nPrevious attempt failed with error: ${lastError}. Please try again and generate a formal executive report.`;
      }
    }

    // Wait before retry (exponential backoff)
    if (attempt < maxAttempts) {
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  console.error(`❌ Report generation failed after ${maxAttempts} attempts`);

  return `## Report Generation Failed\n\nUnable to generate executive report after ${maxAttempts} attempts.\n\n**Error:** ${lastError || "Unknown error"}\n\nPlease try again or contact support if the issue persists.`;
};
