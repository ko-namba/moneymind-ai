import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** 本番では DB エラーや設定のヒントなど内部の詳細を返さず、汎用メッセージにする */
export function publicErrorMessage(error: unknown, fallback: string): string {
  if (process.env.NODE_ENV === "production") {
    return fallback;
  }
  if (typeof error === "string") {
    return error;
  }
  return error instanceof Error ? error.message : fallback;
}

export function rateLimitedResponse() {
  return jsonError(
    "リクエストが多すぎます。しばらく待ってから再度お試しください。",
    429,
  );
}

export function notFoundResponse() {
  return jsonError("Not Found", 404);
}
