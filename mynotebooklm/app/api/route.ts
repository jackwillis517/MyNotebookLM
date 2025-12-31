import { NextRequest } from "next/server";
import getAgent from "@/agents/agent";
import { InferSelectModel } from "drizzle-orm";
import { files } from "@/db/schema";
import { readAllFiles } from "@/actions/db";

export async function POST(request: NextRequest) {
  try {
    const { messages, threadId, searchType } = await request.json();

    console.log("Incoming messages:", JSON.stringify(messages, null, 2));

    // Figure out what kind of embedded files are present
    console.log("Querying files for thread ID: ", threadId);
    const userFiles: InferSelectModel<typeof files>[] =
      await readAllFiles(threadId);

    console.log("Number of files found: ", userFiles.length);

    let isLightRagEmbeddings = false;
    let isNormalEmbeddings = false;
    for (const file of userFiles) {
      if (file.isLightRag) {
        isLightRagEmbeddings = true;
      } else {
        isNormalEmbeddings = true;
      }
    }

    const agent = await getAgent();

    const encoder = new TextEncoder();

    // Create a ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log("Starting agent stream with threadId:", threadId);

          // Use multiple stream modes to get everything
          for await (const [streamMode, chunk] of await agent.stream(
            { messages },
            {
              context: {
                isLightRagEmbeddings: isLightRagEmbeddings,
                isNormalEmbeddings: isNormalEmbeddings,
                searchType: searchType,
              },
              streamMode: ["updates", "messages", "custom"],
              configurable: { thread_id: threadId },
            },
          )) {
            let event = null;

            if (streamMode === "messages") {
              // Token streaming
              const [token, metadata] = chunk as any;

              // Skip tool messages - only stream agent messages
              if (metadata.langgraph_node === "tools") {
                continue;
              }

              if (token.contentBlocks && token.contentBlocks.length > 0) {
                const content = token.contentBlocks
                  .map((block: any) => block.text || "")
                  .join("");

                if (content) {
                  event = {
                    type: "token",
                    content,
                    node: metadata.langgraph_node,
                  };
                }
              }
            } else if (streamMode === "updates") {
              // Agent step updates (tool calls, etc.)
              const [step, content] = Object.entries(chunk as any)[0] as [
                string,
                any,
              ];

              console.log("Agent update - step:", step);

              if (step === "tools" && content.messages) {
                // Tool execution result
                const toolMessage = content.messages[0];
                event = {
                  type: "tool_result",
                  content: toolMessage?.content || toolMessage?.kwargs?.content,
                  toolName:
                    toolMessage?.name || toolMessage?.kwargs?.name || "unknown",
                };
              }
            } else if (streamMode === "custom") {
              // Custom updates from config.writer
              event = {
                type: "custom",
                content: chunk,
              };
            }

            // Send event as SSE
            if (event) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
              );
            }
          }

          // Close the stream
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
