import { NextRequest } from "next/server";
import getAgent from "../../agents/agent";

export async function POST(request: NextRequest) {
  try {
    const { messages, threadId } = await request.json();

    const agent = await getAgent();

    const encoder = new TextEncoder();

    // Create a ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Use multiple stream modes to get everything
          for await (const [streamMode, chunk] of await agent.stream(
            { messages },
            {
              streamMode: ["updates", "messages", "custom"],
              configurable: { thread_id: threadId },
            },
          )) {
            let event = null;

            if (streamMode === "messages") {
              // Token streaming
              const [token, metadata] = chunk as any;
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
              const [step, content] = Object.entries(chunk as any)[0];

              if (step === "tools" && content.messages) {
                // Tool execution result
                event = {
                  type: "tool_result",
                  content: content.messages[0]?.kwargs?.content,
                  toolName: content.messages[0]?.kwargs?.name,
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
