"use server";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { chats, files, messages } from "@/db/schema";

export async function getAllFiles(threadId: string) {
  const results = await db
    .select()
    .from(files)
    .where(eq(files.thread_id, threadId));
  return results;
}

export async function createMessage(
  role: string,
  threadId: string,
  content: string,
) {
  const result = await db.insert(messages).values({
    role,
    content,
    thread_id: threadId,
  });
  return result;
}

export async function getAllChats() {
  const results = await db.select().from(chats).orderBy(desc(chats.updatedAt));
  return results;
}
