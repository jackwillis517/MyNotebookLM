"use server";

import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { db } from "@/db";
import { embeddings } from "@/db/schema";

// Helper to choose appropriate loader based on file type
function getLoader(filepath: string, type: string) {
  if (type === "application/pdf") {
    return new PDFLoader(filepath);
  } else if (type === "text/plain" || type === "text/markdown") {
    return new TextLoader(filepath);
  } else if (
    type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return new DocxLoader(filepath);
  } else if (type === "text/csv") {
    return new CSVLoader(filepath);
  }
  // Add more loaders as needed
  throw new Error(`Unsupported file type: ${type}`);
}

export async function embed(formData: FormData) {
  console.log("Embedding started");
  const filepath = formData.get("filepath") as string;
  const file_id = formData.get("file_id") as string;
  const type = formData.get("type") as string;

  const loader = getLoader(filepath, type);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.splitDocuments(docs);

  const embeddingModel = new OpenAIEmbeddings();

  const texts = chunks.map((chunk) => chunk.pageContent);
  const vectors = await embeddingModel.embedDocuments(texts);

  // Insert embeding vectors
  const embeddingsData = chunks.map((chunk, idx) => ({
    file_id,
    embedding: vectors[idx],
    metadata: chunk.metadata,
  }));

  try {
    const [doc] = await db
      .insert(embeddings)
      .values(embeddingsData)
      .returning();

    return { success: true, createdAt: doc.createdAt };
  } catch (error) {
    console.log("Embed error:", error);
    return { success: false, error: "Embedding failed" };
  }
}
