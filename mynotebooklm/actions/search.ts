"use server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { db } from "@/db";
import { embeddings, files } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { SearchResult, HybridResult } from "@/lib/types";

export async function semanticSearch(
  query: string,
  topK: number = 5,
  minSimilarity: number = 0.7,
): Promise<SearchResult[]> {
  try {
    const embeddingsModel = new OpenAIEmbeddings();

    const queryVector = await embeddingsModel.embedQuery(query);

    const vectorString = `[${queryVector.join(",")}]`;

    const results = await db
      .select({
        file_id: embeddings.file_id,
        content: embeddings.content,
        metadata: embeddings.metadata,
        similarity: sql<number>`1 - (${embeddings.embedding} <=> ${vectorString}::vector)`,
      })
      .from(embeddings)
      .innerJoin(files, eq(embeddings.file_id, files.id))
      .orderBy(sql`${embeddings.embedding} <=> ${vectorString}::vector`)
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

export async function hybridSearch(
  query: string,
  limit: number = 5,
  minSimilarity: number = 0.7,
): Promise<SearchResult[]> {
  try {
    const semanticSearchResult = await semanticSearch(
      query,
      limit,
      minSimilarity,
    );
    const fullTextSearchResult = await fullTextSearch(query, limit);

    // console.log(
    //   "Number of semantic search results:",
    //   semanticSearchResult.length,
    // );
    // console.log(
    //   "Number of full-text search results:",
    //   fullTextSearchResult.length,
    // );

    const results = reciprocalRankFusion(
      semanticSearchResult,
      fullTextSearchResult,
    );

    return results.map((r) => ({
      file_id: r.file_id!,
      content: r.content,
      metadata: r.metadata,
      similarity: r.fusedScore,
    }));
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}

async function fullTextSearch(
  query: string,
  limit: number = 5,
): Promise<SearchResult[]> {
  try {
    const results = await db
      .select({
        file_id: embeddings.file_id,
        content: embeddings.content,
        metadata: embeddings.metadata,
        similarity: sql<number>`ts_rank(${embeddings.tsVector}, websearch_to_tsquery('english', ${query}))`,
      })
      .from(embeddings)
      .innerJoin(files, eq(embeddings.file_id, files.id))
      .where(
        sql`${embeddings.tsVector} @@ websearch_to_tsquery('english', ${query})`,
      )
      .orderBy(
        sql`ts_rank(${embeddings.tsVector}, websearch_to_tsquery('english', ${query})) DESC`,
      )
      .limit(limit);

    return results.map((r) => ({
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

function reciprocalRankFusion(
  vectorResults: SearchResult[],
  textResults: SearchResult[],
  k: number = 60,
): HybridResult[] {
  const scoreMap = new Map<string, number>();
  const docMap = new Map<string, { content: string; metadata?: any }>();

  // Add scores from vector search (rank = position in results, 1-indexed)
  vectorResults.forEach((result, index) => {
    const rank = index + 1;
    const rrfScore = 1 / (k + rank);
    scoreMap.set(result.file_id, rrfScore);
    docMap.set(result.file_id, {
      content: result.content,
      metadata: result.metadata,
    });
  });

  // Add scores from text search (rank = position in results, 1-indexed)
  textResults.forEach((result, index) => {
    const rank = index + 1;
    const rrfScore = 1 / (k + rank);
    const currentScore = scoreMap.get(result.file_id) || 0;
    scoreMap.set(result.file_id, currentScore + rrfScore);

    // Store doc info if not already present
    if (!docMap.has(result.file_id)) {
      docMap.set(result.file_id, {
        content: result.content,
        metadata: result.metadata,
      });
    }
  });

  // Sort by fused score
  const rankedResults: HybridResult[] = Array.from(scoreMap.entries())
    .map(([file_id, fusedScore]) => {
      const doc = docMap.get(file_id)!;
      return {
        file_id,
        content: doc.content,
        metadata: doc.metadata,
        fusedScore,
      };
    })
    .sort((a, b) => b.fusedScore - a.fusedScore);

  return rankedResults;
}
