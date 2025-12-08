import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import {
  semanticSearchTool,
  summaryTool,
  queryRewriteTool,
  saveMemoryTool,
  getMemoryTool,
} from "./tools";
import { AGENT_SYSTEM_PROMPT } from "./prompts";

export default function getAgent() {
  const checkpointer = PostgresSaver.fromConnString(process.env.DATABASE_URL!);

  const model = new ChatOpenAI({
    configuration: {
      baseURL: "http://localhost:1234/v1",
      apiKey: "lmstudio",
    },
    temperature: 0.5,
    streaming: true,
  });

  const agent = createAgent({
    model: model,
    tools: [
      saveMemoryTool,
      getMemoryTool,
      queryRewriteTool,
      summaryTool,
      semanticSearchTool,
    ],
    checkpointer: checkpointer,
    systemPrompt: AGENT_SYSTEM_PROMPT,
  });

  return agent;
}
