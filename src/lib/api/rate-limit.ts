/**
 * 簡易レート制限（サーバーのメモリ上でカウント）。
 * Vercel ではインスタンスごとにカウントが分かれ、再起動でリセットされるため、
 * 厳密な上限ではなく「連打・スクリプトによる大量呼び出し」を抑える目的で使う。
 */
type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5_000;

function pruneExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

/** 上限内なら true。超えていれば false を返す */
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    pruneExpired(now);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

/** Vercel が付与する x-forwarded-for からクライアント IP を取得 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

const AI_PER_IP_LIMIT = 10;
const AI_PER_IP_WINDOW_MS = 60_000;
const AI_GLOBAL_LIMIT = 200;
const AI_GLOBAL_WINDOW_MS = 60 * 60_000;

/** AI を呼び出す API 用。IP ごと（10回/分）と全体（200回/時）の両方で制限する */
export function consumeAIRateLimit(request: Request, scope: string): boolean {
  const ip = getClientIp(request);
  return (
    consumeRateLimit(`${scope}:ip:${ip}`, AI_PER_IP_LIMIT, AI_PER_IP_WINDOW_MS) &&
    consumeRateLimit("ai:global", AI_GLOBAL_LIMIT, AI_GLOBAL_WINDOW_MS)
  );
}
