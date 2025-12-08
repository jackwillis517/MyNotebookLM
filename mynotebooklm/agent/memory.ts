import { Memory } from "mem0ai/oss";

export const memory = new Memory({
  version: "v1.1",
  embedder: {
    provider: "openai",
    config: {
      apiKey: process.env.OPENAI_API_KEY || "",
      model: "text-embedding-3-small",
    },
  },
  vectorStore: {
    provider: "pgvector",
    config: {
      collectionName: "memories",
      embeddingModelDims: 1536,
      user: "neondb_owner",
      password: process.env.NEON_PASSWORD || "",
      host: process.env.NEON_HOST || "",
      port: 5432,
      dbname: "neondb",
    },
  },
  llm: {
    provider: "lmstudio",
    config: {
      model: "qwen/qwen3-vl-4b",
      baseURL: "http://localhost:1234/v1",
    },
  },
  historyDbPath: "memory.db",
});
