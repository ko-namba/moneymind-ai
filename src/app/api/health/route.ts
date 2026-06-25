import { jsonError, jsonOk } from "@/lib/api/response";
import { extractErrorMessage } from "@/lib/db/connection-error";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return jsonError("Not found", 404);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url) {
    return jsonOk({
      ok: false,
      host: null,
      message: "NEXT_PUBLIC_SUPABASE_URL が .env.local に設定されていません。",
      hasAnonKey,
      hasServiceKey,
    });
  }

  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return jsonOk({
      ok: false,
      host: url,
      message: "NEXT_PUBLIC_SUPABASE_URL の形式が不正です。",
      hasAnonKey,
      hasServiceKey,
    });
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    return jsonOk({
      ok: false,
      host,
      message: "SUPABASE_SERVICE_ROLE_KEY が .env.local に設定されていません。",
      hasAnonKey,
      hasServiceKey,
    });
  }

  try {
    const response = await fetch(`${url}/rest/v1/expenses?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      cache: "no-store",
    });

    const body = await response.text();

    if (!response.ok) {
      return jsonOk({
        ok: false,
        host,
        httpStatus: response.status,
        message:
          response.status === 503
            ? "Supabase API がまだ停止中です。Dashboard の Project URL と .env.local の URL が同じか確認してください。"
            : `Supabase API エラー: ${body.slice(0, 200)}`,
        hasAnonKey,
        hasServiceKey,
      });
    }

    return jsonOk({
      ok: true,
      host,
      httpStatus: response.status,
      message: "Supabase に接続できました。",
      hasAnonKey,
      hasServiceKey,
    });
  } catch (error) {
    return jsonOk({
      ok: false,
      host,
      message: extractErrorMessage(error),
      hasAnonKey,
      hasServiceKey,
    });
  }
}
