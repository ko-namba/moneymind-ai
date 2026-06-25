"use client";

import { useState } from "react";
import { formatYen } from "@/lib/expenses/format";
import {
  parseNaturalInputApi,
  type NaturalInputResponse,
} from "@/lib/expenses/client";
import type { ExpenseInput } from "@/types/expense";

const EXAMPLE_INPUTS = [
  "ランチ500円",
  "電車代280円",
  "映画2000円",
  "ドラッグストア1200円",
] as const;

type NaturalInputProps = {
  onSubmit: (input: ExpenseInput) => Promise<void>;
};

export function NaturalInput({ onSubmit }: NaturalInputProps) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<NaturalInputResponse | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleParse = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setParseError("入力内容を入力してください。");
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setSubmitError(null);
    setSuccessMessage(null);
    setParsed(null);

    try {
      const result = await parseNaturalInputApi(trimmed);
      setParsed(result);
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "解析に失敗しました。",
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleRegister = async () => {
    if (!parsed) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      await onSubmit(parsed.input);
      setSuccessMessage("支出を登録しました。");
      setParsed(null);
      setText("");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "登録に失敗しました。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setText(example);
    setParsed(null);
    setParseError(null);
    setSubmitError(null);
    setSuccessMessage(null);
  };

  return (
    <section className="mm-section">
      <h2 className="mm-section-title">かんたん入力</h2>
      <p className="mt-2 text-sm" style={{ color: "var(--mf-text)" }}>
        「ランチ500円」のように書くと、金額とカテゴリを読み取ります。
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleParse();
            }
          }}
          placeholder="例: ランチ500円"
          className="mm-input flex-1"
        />
        <button
          type="button"
          onClick={() => void handleParse()}
          disabled={isParsing || isSubmitting}
          className="mm-btn-accent shrink-0"
        >
          {isParsing ? "読み取り中..." : "読み取る"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {EXAMPLE_INPUTS.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleExampleClick(example)}
            className="mm-chip"
          >
            {example}
          </button>
        ))}
      </div>

      {parseError && <p className="mt-3 mm-alert-error">{parseError}</p>}

      {parsed && (
        <div className="mt-4 space-y-3 mm-soft-surface p-4">
          <p className="text-sm" style={{ color: "var(--mf-text)" }}>
            {parsed.message}
          </p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs" style={{ color: "var(--mf-text)" }}>
                金額
              </dt>
              <dd className="font-semibold" style={{ color: "var(--mf-text-strong)" }}>
                {formatYen(parsed.input.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-xs" style={{ color: "var(--mf-text)" }}>
                カテゴリ
              </dt>
              <dd className="font-semibold" style={{ color: "var(--mf-text-strong)" }}>
                {parsed.input.category}
              </dd>
            </div>
            <div>
              <dt className="text-xs" style={{ color: "var(--mf-text)" }}>
                メモ
              </dt>
              <dd className="font-semibold" style={{ color: "var(--mf-text-strong)" }}>
                {parsed.input.description || "（メモなし）"}
              </dd>
            </div>
            <div>
              <dt className="text-xs" style={{ color: "var(--mf-text)" }}>
                日付
              </dt>
              <dd className="font-semibold" style={{ color: "var(--mf-text-strong)" }}>
                {parsed.input.date}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => void handleRegister()}
            disabled={isSubmitting}
            className="mm-btn-accent mt-4"
          >
            {isSubmitting ? "登録中..." : "この内容で登録"}
          </button>
        </div>
      )}

      {submitError && <p className="mt-3 mm-alert-error">{submitError}</p>}
      {successMessage && (
        <p className="mt-3 mm-alert-success">{successMessage}</p>
      )}
    </section>
  );
}
