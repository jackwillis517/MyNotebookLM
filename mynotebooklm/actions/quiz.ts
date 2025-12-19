"use server";
import getAgent from "@/agents/agent";
import { search } from "./search";

export default async function createQuiz(threadId: string) {
  console.log("createQuiz called");
  console.log("Constructing corpus");
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

  const prompt = `Generate a QUIZ. Generate a quiz with 5 questions based on the following corpus:\n\n${corpus}`;

  console.log("Calling parent agent");
  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: prompt }],
    },
    {
      configurable: { thread_id: threadId },
    },
  );

  console.log("Success! Quiz generated!");
  const lastMessage = result.messages[result.messages.length - 1];
  const quizContent = lastMessage.content as string;
  const secondToLastMessage = result.messages[result.messages.length - 2];
  const quizToolContent = secondToLastMessage.content as string;
  console.log("Quiz tool content:", quizToolContent);
  console.log("Quiz content:", quizContent);

  return result.toString();
}
