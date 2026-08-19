import { getAIStatus } from "@/lib/ai/config";
import { jsonOk } from "@/lib/api/response";

/** 現在の AI プロバイダー設定を確認する（開発・デバッグ用） */
export async function GET() {
  return jsonOk(getAIStatus());
}
