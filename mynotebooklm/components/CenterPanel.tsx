"use client";

import { useState } from "react";
import { Send, Mic, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const CenterPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. Upload documents on the left and ask me anything about them, or use the generation tools on the right.",
    },
  ]);
  const [input, setInput] = useState("");
  const [threadsOpen, setThreadsOpen] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content:
            "I understand your question. Let me help you with that based on your documents.",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="h-full flex bg-panel-background rounded-lg border border-panel-border overflow-hidden">
      {/* Message Threads Sidebar */}
      <div
        className={cn(
          "border-r border-panel-border transition-all duration-300 overflow-hidden",
          threadsOpen ? "w-64" : "w-0",
        )}
      >
        <div className="p-4 h-full">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Recent Threads
          </h3>
          <div className="space-y-2">
            {["Product Analysis", "Research Summary", "Meeting Notes"].map(
              (thread, idx) => (
                <Card
                  key={idx}
                  className="p-3 bg-secondary/30 border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <p className="text-sm text-foreground truncate">{thread}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 hours ago
                  </p>
                </Card>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b border-panel-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setThreadsOpen(!threadsOpen)}
            className="h-8 w-8 p-0"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">Chat</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
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
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-panel-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything about your documents..."
              className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <Mic className="h-5 w-5" />
            </Button>
            <Button onClick={handleSend} size="icon">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterPanel;
