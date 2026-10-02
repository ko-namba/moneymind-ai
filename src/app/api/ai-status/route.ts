import { getAIStatus } from "@/lib/ai/config";
import { jsonOk, notFoundResponse } from "@/lib/api/response";

/** 現在の AI プロバイダー設定を確認する（開発・デバッグ用。本番では無効） */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return notFoundResponse();
  }

  return jsonOk(getAIStatus());
}
