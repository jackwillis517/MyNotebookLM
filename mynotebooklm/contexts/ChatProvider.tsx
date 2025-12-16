"use client";

import { useContext, useState, ReactNode } from "react";
import { ChatContext } from "./ChatContext";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  return (
    <ChatContext.Provider value={{ selectedThreadId, setSelectedThreadId }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
