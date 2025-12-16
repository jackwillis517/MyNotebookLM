import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import {
  semanticSearch,
  summarize,
  queryRewrite,
  saveMemory,
  getMemory,
} from "./tools";
import { AGENT_SYSTEM_PROMPT } from "./prompts";

let checkpointerInstance: PostgresSaver | null = null;

async function getCheckpointer() {
  if (!checkpointerInstance) {
    checkpointerInstance = PostgresSaver.fromConnString(
      process.env.DATABASE_URL!,
    );
    await checkpointerInstance.setup();
  }
  return checkpointerInstance;
}

export default async function getAgent() {
  const checkpointer = await getCheckpointer();

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    // configuration: {
    //   baseURL: "http://localhost:1234/v1",
    //   apiKey: "lmstudio",
    // },
    temperature: 0.5,
    streaming: true,
  });

  const tools = [
    semanticSearch,
    summarize,
    queryRewrite,
    saveMemory,
    getMemory,
  ];

  console.log("Creating agent with", tools.length, "tools");

  const agent = createAgent({
    model: model,
    tools: tools,
    checkpointer: checkpointer,
    systemPrompt: AGENT_SYSTEM_PROMPT,
  });

  return agent;
}
