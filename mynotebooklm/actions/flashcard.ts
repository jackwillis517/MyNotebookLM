"use server";
import getAgent from "@/agents/agent";
import { search } from "./search";

export default async function createFlashcards(threadId: string) {
  const results = await search(
    "main topics, key concepts, important facts, definitions, core ideas",
    15,
  );

  const corpus = results
    .map(
      (chunk, idx) => `[Source ${idx + 1}: ${chunk.file_id}]\n${chunk.content}`,
    )
    .join("\n\n---\n\n");

  const agent = await getAgent();

  const prompt = `Generate a FLASHCARDS. Generate a flashcards with 5 questionsbased on the following corpus:\n\n${corpus}`;

  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: prompt }],
    },
    {
      configurable: { thread_id: threadId },
    },
  );

  const flashcardContent = result.messages[result.messages.length - 2]
    .content as string;
  // console.log("Flashcard content:", flashcardContent);
  return JSON.parse(flashcardContent);
}
