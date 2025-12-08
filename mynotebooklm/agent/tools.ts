import * as z from "zod";
import { tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { semanticSearch } from "@/actions/semanticSearch";
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
  configuration: {
    baseURL: "http://localhost:1234/v1",
    apiKey: "lmstudio",
  },
  temperature: 0.5,
});

export const saveMemoryTool = tool(
  async ({ memories }) => {
    console.log("Calling saveMemoryTool...");
    await memory.add(memories, { userId: "user123" });
  },
  {
    name: "memory",
    description: SAVE_MEMORY_TOOL_DESCRIPTION,
    schema: z.object({
      memories: z.string().describe("The memory to save"),
    }),
  },
);

export const getMemoryTool = tool(
  async ({ query }) => {
    console.log("Calling getMemoryTool...");
    const results = await memory.search(query, { userId: "user123" });
    return results;
  },
  {
    name: "memory",
    description: GET_MEMORY_TOOL_DESCRIPTION,
    schema: z.object({
      query: z.string().describe("The query to search memory with"),
    }),
  },
);

export const queryRewriteTool = tool(
  async ({ query }) => {
    console.log("Calling queryRewriteTool...");
    const result = await model.invoke([
      { role: "system", content: QUERY_REWRITE_TOOL_PROMPT },
      { role: "user", content: query },
    ]);
    return result.toString();
  },
  {
    name: "queryRewrite",
    description: QUERY_REWRITE_TOOL_DESCRIPTION,
    schema: z.object({
      query: z.string().describe("The query to be rewritten"),
    }),
  },
);

export const summaryTool = tool(
  async ({ content }) => {
    console.log("Calling summarizeTool...");
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

export const semanticSearchTool = tool(
  async ({ query, k, minSimilarity }) => {
    console.log("Calling semanticSearchTool...");
    const result = await semanticSearch(query, k, minSimilarity);
    return result.toString();
  },
  {
    name: "semanticSearch",
    description: SEMANTIC_SEARCH_TOOL_DESCRIPTION,
    schema: z.object({
      query: z.string().describe("The query to search for"),
      k: z.number().describe("The number of results to return"),
      minSimilarity: z
        .number()
        .describe("The minimum similarity score to return"),
    }),
  },
);
