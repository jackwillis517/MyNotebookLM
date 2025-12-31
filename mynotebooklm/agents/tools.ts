import * as z from "zod";
import { tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { semanticSearch, hybridSearch } from "@/actions/search";
import { memory } from "./memory";
import {
  SAVE_MEMORY_TOOL_DESCRIPTION,
  GET_MEMORY_TOOL_DESCRIPTION,
  QUERY_REWRITE_TOOL_PROMPT,
  QUERY_REWRITE_TOOL_DESCRIPTION,
  SUMMARY_TOOL_PROMPT,
  SUMMARY_TOOL_DESCRIPTION,
  SEARCH_TOOL_DESCRIPTION,
} from "./prompts";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  // configuration: {
  //   baseURL: "http://localhost:1234/v1",
  //   apiKey: "lmstudio",
  // },
  temperature: 0.5,
});

export const saveMemory = tool(
  async ({ memories }) => {
    console.log("Calling saveMemory...");
    await memory.add(memories, { userId: "user123" });
    return "Memory saved successfully";
  },
  {
    name: "save_memory",
    description: SAVE_MEMORY_TOOL_DESCRIPTION,
    schema: z.object({
      memories: z.string().describe("The memory to save"),
    }),
  },
);

export const getMemory = tool(
  async ({ query }) => {
    console.log("Calling getMemory...");
    const results = await memory.search(query, { userId: "user123" });
    return JSON.stringify(results);
  },
  {
    name: "get_memory",
    description: GET_MEMORY_TOOL_DESCRIPTION,
    schema: z.object({
      query: z.string().describe("The query to search memory with"),
    }),
  },
);

export const queryRewrite = tool(
  async ({ query }) => {
    console.log("Calling queryRewrite...");
    const result = await model.invoke([
      { role: "system", content: QUERY_REWRITE_TOOL_PROMPT },
      { role: "user", content: query },
    ]);
    return result.toString();
  },
  {
    name: "query_rewrite",
    description: QUERY_REWRITE_TOOL_DESCRIPTION,
    schema: z.object({
      query: z.string().describe("The query to be rewritten"),
    }),
  },
);

export const summarize = tool(
  async ({ content }) => {
    console.log("Calling summarize...");
    const result = await model.invoke([
      { role: "system", content: SUMMARY_TOOL_PROMPT },
      { role: "user", content: content },
    ]);
    return result.toString();
  },
  {
    name: "summarize",
    description: SUMMARY_TOOL_DESCRIPTION,
    schema: z.object({
      content: z.string().describe("The text to be summarized"),
    }),
  },
);

export const search = tool(
  async ({ query, k = 5, min_similarity = 0.7 }, config) => {
    const normalEmbeddings = config.context.isNormalEmbeddings;
    const lightRagEmbeddings = config.context.isLightRagEmbeddings;
    const searchType = config.context.searchType;

    // Check if there are uploaded files
    if (normalEmbeddings || lightRagEmbeddings) {
      let result = "";

      // If there are files embedded with LightRAG search using LightRAG
      if (lightRagEmbeddings) {
        console.log("Call LightRAGSearch");
        // call light rag search function
      }

      // If there are files embedded with normal embeddings search using a search function
      if (normalEmbeddings) {
        console.log("Calling " + searchType + "Search");
        if (searchType == "semantic") {
          result += JSON.stringify(
            await semanticSearch(query, k, min_similarity),
          );
        } else {
          result += JSON.stringify(
            await hybridSearch(query, k, min_similarity),
          );
        }
      }

      console.log("Search results:", result);
      return result;
    } else {
      return "No files uploaded.";
    }
  },
  {
    name: "search",
    description: SEARCH_TOOL_DESCRIPTION,
    schema: z.object({
      query: z.string().describe("The search query to find relevant documents"),
      k: z
        .number()
        .optional()
        .default(5)
        .describe("Number of results to return (default: 5)"),
      min_similarity: z
        .number()
        .optional()
        .default(0.7)
        .describe("Minimum similarity score threshold (default: 0.7)"),
    }),
  },
);
