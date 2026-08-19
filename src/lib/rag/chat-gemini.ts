import { generateGeminiContent } from "@/lib/ai/gemini";
import { buildRetrievedContext } from "@/lib/rag/retriever";
import type { ChatHistoryItem, ChatSource } from "@/types/chat";

const SYSTEM_PROMPT = `あなたは MoneyMind の家計簿 AI アシスタントです。
ユーザーの質問に、提供された「家計サマリー」と「引用元の支出データ」だけに基づいて日本語で答えてください。

ルール:
- 引用元にない数値や事実は推測しない
- 根拠が弱い場合は「登録データからは断定できません」と述べる
- カテゴリ別の増減や具体的な支出例を示す
- 簡潔で分かりやすい口調（3〜8文程度）
- 回答本文に [引用1] のような番号は付けない（引用元は別 UI で表示される）`;

function formatHistory(history: ChatHistoryItem[]): string {
  if (history.length === 0) {
    return "（なし）";
  }

  return history
    .slice(-6)
    .map((item) => `${item.role === "user" ? "ユーザー" : "AI"}: ${item.content}`)
    .join("\n");
}

/** Gemini API で家計相談に回答 */
export async function answerExpenseQuestionWithGemini(
  question: string,
  history: ChatHistoryItem[],
  sources: ChatSource[],
  summaryContext: string,
): Promise<string> {
  const retrievedContext = buildRetrievedContext(sources);
  const historyContext = formatHistory(history);

  const prompt = `## 家計サマリー
${summaryContext}

## 関連する支出データ（引用元）
${retrievedContext}

## これまでの会話
${historyContext}

## 質問
${question}`;

  const response = await generateGeminiContent({
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.3,
    },
  });

  return response.text?.trim() ?? "";
}
