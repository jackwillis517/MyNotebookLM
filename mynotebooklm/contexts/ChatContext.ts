import { createContext } from "react";

export interface ChatContextType {
  selectedThreadId: string | null;
  setSelectedThreadId: (threadId: string | null) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);
