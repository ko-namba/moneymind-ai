import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import {
  buildRetrievedContext,
  buildSummaryContext,
  retrieveRelevantExpenses,
} from "@/lib/rag/retriever";
import type { ChatHistoryItem, ChatResponse } from "@/types/chat";

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

export async function answerExpenseQuestion(
  question: string,
  history: ChatHistoryItem[] = [],
): Promise<ChatResponse> {
  const [sources, summaryContext] = await Promise.all([
    retrieveRelevantExpenses(question),
    buildSummaryContext(),
  ]);

  const retrievedContext = buildRetrievedContext(sources);
  const historyContext = formatHistory(history);

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    [
      "human",
      `## 家計サマリー
{summaryContext}

## 関連する支出データ（引用元）
{retrievedContext}

## これまでの会話
{historyContext}

## 質問
{question}`,
    ],
  ]);

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.3,
  });

  const chain = RunnableSequence.from([
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const answer = await chain.invoke({
    summaryContext,
    retrievedContext,
    historyContext,
    question,
  });

  if (sources.length === 0) {
    return {
      answer:
        answer.trim() ||
        "関連する支出データが見つかりませんでした。まず支出を登録してから、再度質問してください。",
      sources: [],
    };
  }

  return {
    answer: answer.trim(),
    sources,
  };
}
