"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  readAllChats,
  updateChat,
  readAllMessages,
  createMessage,
} from "@/actions/db";
import { Chat, Message } from "@/lib/types";
import { Send, Mic, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useChatContext } from "@/contexts/ChatProvider";

export default function CenterPanel() {
  const { setSelectedThreadId, selectedThreadId } = useChatContext();
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat>();
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [customUpdates, setCustomUpdates] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [threadsOpen, setThreadsOpen] = useState<boolean>(false);

  // Get all the chats
  useEffect(() => {
    const fetchChats = async () => {
      const chats = await readAllChats();
      setChatList(chats);

      if (chats.length > 0) {
        // Set the selected chat to the most recently edited chat
        setSelectedChat(chats[0]);
        // Set the global thread ID for other components
        setSelectedThreadId(chats[0].threadId);

        // Fetch messages for the selected chat
        const messages = await readAllMessages(chats[0].threadId);
        setMessageList(messages);
      }
    };
    fetchChats();
  }, [setSelectedThreadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessageList((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setCustomUpdates([]);

    // Create user message in db
    await createMessage(selectedThreadId!, userMessage);
    // Update the chat with this threadId's updated_at field
    await updateChat(selectedChat!);

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messageList, userMessage],
          threadId: selectedThreadId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      // Add empty assistant message to state
      setMessageList((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6));

              if (event.type === "token") {
                // Accumulate tokens
                assistantContent += event.content;
                assistantMessage.content = assistantContent;

                // Update the last message
                setMessageList((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content =
                    assistantContent;
                  return newMessages;
                });
              } else if (event.type === "tool_result") {
                // Show tool execution
                setCustomUpdates((prev) => [
                  ...prev,
                  `🛠️ ${event.toolName}: ${event.content}`,
                ]);
              } else if (event.type === "custom") {
                // Show custom updates from config.writer
                setCustomUpdates((prev) => [...prev, event.content]);
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
              console.error("Parse error:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = "Something went wrong please try again.";

      setMessageList((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = errorMessage;
        assistantMessage.content = errorMessage;
        return newMessages;
      });
    } finally {
      // Save assistant message to database
      await createMessage(selectedThreadId!, assistantMessage);
      // Update the selected chat's updatedAt field
      await updateChat(selectedChat!);

      setIsLoading(false);
      setCustomUpdates([]);
    }
  };

  const handleChatSelect = async (chat: Chat) => {
    // Set the selected chat to this one
    setSelectedChat(chat);
    // Set the global thread ID for other components
    setSelectedThreadId(chat.threadId);

    // Read messages for the selected chat
    const messages = await readAllMessages(chat.threadId);
    setMessageList(messages);
  };

  return (
    <div className="h-full flex bg-panel-background rounded-lg border border-panel-border overflow-hidden">
      {/* Chats Sidebar */}
      <div
        className={cn(
          "border-r border-panel-border transition-all duration-300 overflow-hidden",
          threadsOpen ? "w-64" : "w-0",
        )}
      >
        <div className="p-4 h-full">
          <h3 className="text-sm font-semibold text-foreground mb-3">Chats</h3>
          <div className="space-y-2">
            {chatList.map((chat) => (
              <Card
                key={chat.threadId}
                onClick={() => handleChatSelect(chat)}
                className="p-3 bg-secondary/30 border-border hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <p className="text-sm text-foreground truncate">{chat.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {chat.updatedAt.toDateString()}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 p-4 border-b border-panel-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setThreadsOpen(!threadsOpen)}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">
            {selectedChat?.title}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messageList.map((message, index) => (
            <div
              key={`${new Date().getTime()}-${index}`}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-4",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground",
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {/*{isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : null}*/}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-panel-border">
          <div className="flex gap-2">
            <form onSubmit={handleSubmit} className="flex gap-2 w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit}
                placeholder="Ask me anything..."
                className="flex-1 pl-5 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />

              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary"
              >
                <Mic className="h-5 w-5" />
              </Button>

              <Button size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
