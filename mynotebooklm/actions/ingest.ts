import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";

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

export async function ingest(filepath: string, type: string) {
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
}
