export interface Chat {
  threadId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface SearchResult {
  file_id: string;
  content: string;
  metadata?: any;
  similarity: number;
}
