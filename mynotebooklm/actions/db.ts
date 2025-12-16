"use server";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { chats, files, messages } from "@/db/schema";
import { Chat, Message } from "@/lib/types";

export async function readAllChats(): Promise<Chat[]> {
  const results = await db.select().from(chats).orderBy(desc(chats.updatedAt));
  return results.map((chat) => {
    return {
      threadId: chat.thread_id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  });
}

export async function updateChat(chat: Chat) {
  await db
    .update(chats)
    .set({ updatedAt: new Date() })
    .where(eq(chats.thread_id, chat.threadId));
}

export async function readAllFiles(threadId: string) {
  const results = await db
    .select()
    .from(files)
    .where(eq(files.thread_id, threadId));
  return results;
}

export async function createMessage(threadId: string, message: Message) {
  const result = await db
    .insert(messages)
    .values({
      thread_id: threadId,
      role: message.role,
      content: message.content,
      createdAt: new Date(),
    })
    .returning();

  return result[0]; // Returns the inserted message as a plain object
}

export async function readAllMessages(threadId: string): Promise<Message[]> {
  const results = await db
    .select()
    .from(messages)
    .where(eq(messages.thread_id, threadId));
  return results.map((message) => {
    return {
      role: message.role as "user" | "assistant",
      content: message.content,
    };
  });
}
