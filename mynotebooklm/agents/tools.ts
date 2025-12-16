import * as z from "zod";
import { tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { search } from "@/actions/search";
import { memory } from "./memory";
import {
  SAVE_MEMORY_TOOL_DESCRIPTION,
  GET_MEMORY_TOOL_DESCRIPTION,
  QUERY_REWRITE_TOOL_PROMPT,
  QUERY_REWRITE_TOOL_DESCRIPTION,
  SUMMARY_TOOL_PROMPT,
  SUMMARY_TOOL_DESCRIPTION,
  SEMANTIC_SEARCH_TOOL_DESCRIPTION,
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

export const semanticSearch = tool(
  async ({ query, k = 5, min_similarity = 0.7 }) => {
    console.log("Calling semanticSearch with:", {
      query,
      k,
      min_similarity,
    });
    const result = await search(query, k, min_similarity);
    console.log("Search results:", result);
    return JSON.stringify(result);
  },
  {
    name: "semantic_search",
    description: SEMANTIC_SEARCH_TOOL_DESCRIPTION,
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
