import type { ChatHistoryItem, ChatResponse } from "@/types/chat";

async function parseApiError(response: Response): Promise<string> {
  const data: unknown = await response.json().catch(() => null);
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }
  return "リクエストに失敗しました。";
}

export async function sendChatMessage(
  message: string,
  history: ChatHistoryItem[] = [],
): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}
