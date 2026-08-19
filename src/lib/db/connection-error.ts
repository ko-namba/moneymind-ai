export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const cause =
      error.cause instanceof Error
        ? error.cause.message
        : typeof error.cause === "string"
          ? error.cause
          : "";
    return [error.message, cause].filter(Boolean).join(" ");
  }

  if (error && typeof error === "object" && "message" in error) {
    const record = error as { message?: unknown; code?: unknown; details?: unknown };
    const parts = [
      typeof record.message === "string" ? record.message : "",
      typeof record.code === "string" ? record.code : "",
      typeof record.details === "string" ? record.details : "",
    ].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(" ");
    }
  }

  return String(error);
}

/** Supabase 接続エラーをユーザー向けメッセージに変換 */
export function formatSupabaseConnectionError(
  context: string,
  error: unknown,
): string {
  const message = extractErrorMessage(error);
  const combined = message.toLowerCase();

  if (
    combined.includes("fetch failed") ||
    combined.includes("503") ||
    combined.includes("service unavailable") ||
    combined.includes("econnrefused") ||
    combined.includes("enotfound") ||
    combined.includes("network") ||
    combined.includes("unable to verify the first certificate") ||
    combined.includes("certificate")
  ) {
    if (
      combined.includes("unable to verify the first certificate") ||
      combined.includes("certificate")
    ) {
      return `${context} SSL 証明書の検証に失敗しました（会社のネットワークでよく起きます）。開発サーバーを \`npm run dev\` で再起動してください（--use-system-ca を有効化済み）。`;
    }

    return `${context} Supabase に接続できません。Dashboard の Settings → API の Project URL と .env.local の NEXT_PUBLIC_SUPABASE_URL が同じか確認してください。診断: http://localhost:3000/api/health`;
  }

  if (
    combined.includes('relation "expenses" does not exist') ||
    combined.includes("does not exist")
  ) {
    return `${context} データベースのテーブルが見つかりません。Supabase の SQL Editor で docs/supabase/schema.sql を実行してください。`;
  }

  return `${context} ${message}`;
}
