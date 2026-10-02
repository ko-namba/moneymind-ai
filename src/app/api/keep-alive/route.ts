import { jsonError, jsonOk } from "@/lib/api/response";
import { createSupabaseAdmin } from "@/lib/db/supabase";

/**
 * Supabase 無料プランの自動停止を防ぐため、Vercel Cron から1日1回呼ばれる。
 * 停止判定は DB へのクエリ有無で行われるため、テーブルを実際に読む必要がある。
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (
    cronSecret &&
    request.headers.get("authorization") !== `Bearer ${cronSecret}`
  ) {
    return jsonError("Unauthorized", 401);
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("expenses").select("id").limit(1);

  if (error) {
    console.error("GET /api/keep-alive", error);
    return jsonError("Supabase へのアクセスに失敗しました。", 500);
  }

  return jsonOk({ ok: true, checkedAt: new Date().toISOString() });
}
