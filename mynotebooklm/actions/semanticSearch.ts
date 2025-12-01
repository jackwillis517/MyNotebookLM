"use server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { db } from "@/db";
import { embeddings, files } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export interface SearchResult {
  file_id: string;
  metadata?: any;
  similarity: number;
}

export async function semanticSearch(
  query: string,
  topK: number = 5,
  minSimilarity: number = 0.7,
): Promise<SearchResult[]> {
  try {
    const embeddingsModel = new OpenAIEmbeddings();

    const queryVector = await embeddingsModel.embedQuery(query);

    const vectorString = `[${queryVector.join(',')}]`;

    const results = await db
      .select({
        file_id: embeddings.file_id,
        content: embeddings.content,
        metadata: embeddings.metadata,
        similarity: sql<number>`1 - (${embeddings.embedding} <=> ${vectorString}::vector)`,
      })
      .from(embeddings)
      .innerJoin(files, eq(embeddings.file_id, files.id))
      .orderBy(
        sql`${embeddings.embedding} <=> ${vectorString}::vector`,
      )
      .limit(topK);

    return results
      .filter((r) => r.similarity >= minSimilarity)
      .map((r) => ({
        file_id: r.file_id!,
        content: r.content,
        metadata: r.metadata,
        similarity: r.similarity,
      }));
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}
