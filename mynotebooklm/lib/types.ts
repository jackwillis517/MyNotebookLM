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
