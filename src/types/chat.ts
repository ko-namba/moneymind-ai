export type ChatRole = "user" | "assistant";

export type ChatHistoryItem = {
  role: ChatRole;
  content: string;
};

export type ChatSource = {
  id: string;
  expenseId: string;
  content: string;
  similarity: number;
  amount: number;
  category: string;
  description: string;
  date: string;
};

export type ChatResponse = {
  answer: string;
  sources: ChatSource[];
};

export type ChatMessage = ChatHistoryItem & {
  id: string;
  sources?: ChatSource[];
};
