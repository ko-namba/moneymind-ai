export type AIProvider = "openai" | "gemini" | "free";

/** Google AI Studio の API キー形式か（AIza または AQ. で始まる） */
export function isValidGeminiApiKey(apiKey: string): boolean {
  if (apiKey.length < 20) {
    return false;
  }

  // 従来の Standard キー
  if (apiKey.startsWith("AIza")) {
    return true;
  }

  // 2026年以降の Auth キー（Google AI Studio の新形式）
  if (apiKey.startsWith("AQ.")) {
    return true;
  }

  return false;
}

/** OpenAI API キーが有効に設定されているか */
export function isOpenAIEnabled(): boolean {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return false;
  }

  if (apiKey.startsWith("sb_") || apiKey.startsWith("eyJ")) {
    return false;
  }

  return apiKey.startsWith("sk-");
}

/** Gemini API キーが設定されているか */
export function isGeminiEnabled(): boolean {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  return Boolean(apiKey);
}

/** Gemini キーの設定ミスを人間向けに説明 */
export function getGeminiKeyIssue(): string | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return "GEMINI_API_KEY が未設定です。";
  }

  if (!isValidGeminiApiKey(apiKey)) {
    return [
      "GEMINI_API_KEY の形式が正しくない可能性があります。",
      "Google AI Studio（https://aistudio.google.com/apikey）で発行したキーを設定してください。",
      "（「AIza」または「AQ.」で始まる形式）",
    ].join("");
  }

  return null;
}

/** 利用する AI プロバイダーを返す */
export function getAIProvider(): AIProvider {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  const hasGeminiKey = isGeminiEnabled();

  if (explicit === "free") {
    return "free";
  }

  // AI_PROVIDER=gemini のときはキーがあれば Gemini を使う
  if (explicit === "gemini") {
    return hasGeminiKey ? "gemini" : "free";
  }

  if (explicit === "openai" && isOpenAIEnabled()) {
    return "openai";
  }

  // 未指定時: Gemini → OpenAI → 無料モードの順
  if (hasGeminiKey) {
    return "gemini";
  }
  if (isOpenAIEnabled()) {
    return "openai";
  }

  return "free";
}

/** チャット・自然言語解析に LLM を使えるか */
export function isLLMEnabled(): boolean {
  const provider = getAIProvider();
  return provider === "openai" || provider === "gemini";
}

/** pgvector 用 embedding（OpenAI のみ。DB は vector(1536)） */
export function isEmbeddingEnabled(): boolean {
  return getAIProvider() === "openai";
}

/** 後方互換のエイリアス */
export function isAIEnabled(): boolean {
  return isLLMEnabled();
}

/** デバッグ用の AI 設定サマリー（キー本体は含めない） */
export function getAIStatus() {
  const geminiKey = process.env.GEMINI_API_KEY?.trim() ?? "";
  return {
    provider: getAIProvider(),
    aiProviderEnv: process.env.AI_PROVIDER?.trim() || null,
    geminiKeyConfigured: geminiKey.length > 0,
    geminiKeyFormatOk: isValidGeminiApiKey(geminiKey),
    geminiKeyPrefix: geminiKey ? `${geminiKey.slice(0, 4)}...` : null,
    openaiEnabled: isOpenAIEnabled(),
    keyIssue: getGeminiKeyIssue(),
  };
}
