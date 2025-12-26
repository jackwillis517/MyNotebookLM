"use server";
import getAgent from "@/agents/agent";
import { semanticSearch } from "./search";

export default async function createQuiz(threadId: string) {
  const results = await semanticSearch(
    "main topics, key concepts, important facts, definitions, core ideas",
    15,
  );

  const corpus = results
    .map(
      (chunk, idx) => `[Source ${idx + 1}: ${chunk.file_id}]\n${chunk.content}`,
    )
    .join("\n\n---\n\n");

  const agent = await getAgent();

  const prompt = `Generate a QUIZ. Generate a quiz with 5 questions based on the following corpus:\n\n${corpus}`;

  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: prompt }],
    },
    {
      configurable: { thread_id: threadId },
    },
  );

  const quizContent = result.messages[result.messages.length - 2]
    .content as string;
  // console.log("Quiz content:", quizContent);
  return JSON.parse(quizContent);
}
