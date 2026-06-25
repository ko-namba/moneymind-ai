"use client";

import { useState } from "react";
import { sendChatMessage } from "@/lib/chat/client";
import { SourceCitation } from "@/components/SourceCitation";
import type { ChatHistoryItem, ChatMessage } from "@/types/chat";

const EXAMPLE_QUESTIONS = [
  "今月の食費はいくら？",
  "今月なぜ食費が増えた？",
  "最近の大きな支出は？",
  "交通費の内訳を教えて",
] as const;

function createMessageId(): string {
  return crypto.randomUUID();
}

export function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const history: ChatHistoryItem[] = nextMessages.map((message) => ({
        role: message.role,
        content: message.content,
      }));

      const response = await sendChatMessage(trimmed, history.slice(0, -1));

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mm-panel flex h-[calc(100vh-11rem)] min-h-[520px] flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: "var(--mf-text)" }}>
              登録した支出について、質問してみてください。
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {EXAMPLE_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void sendMessage(question)}
                  className="mm-chip"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mm-fade-in flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 text-sm leading-7 ${
                  message.role === "user" ? "text-white" : "text-[var(--mf-text-strong)]"
                }`}
                style={{
                  borderRadius: "var(--mf-radius-lg)",
                  ...(message.role === "user"
                    ? { backgroundColor: "var(--mf-primary)" }
                    : {
                        backgroundColor: "var(--mf-surface)",
                        boxShadow: "0 4px 16px rgba(15, 40, 80, 0.05)",
                      }),
                }}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.role === "assistant" && message.sources && (
                  <SourceCitation sources={message.sources} />
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <p className="text-sm" style={{ color: "var(--mf-text)" }}>
              回答を準備しています...
            </p>
          </div>
        )}
      </div>

      {error && <p className="mb-2 mm-alert-error">{error}</p>}

      <form
        className="border-t mm-divider pt-6"
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage(input);
        }}
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="質問を入力"
            disabled={isLoading}
            className="mm-input flex-1"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="mm-btn shrink-0"
          >
            {isLoading ? "送信中..." : "送信"}
          </button>
        </div>
      </form>
    </div>
  );
}
