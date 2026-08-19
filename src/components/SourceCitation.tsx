import { formatYen } from "@/lib/expenses/format";
import type { ChatSource } from "@/types/chat";

type SourceCitationProps = {
  sources: ChatSource[];
};

export function SourceCitation({ sources }: SourceCitationProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2 border-t mm-divider pt-3">
      <p className="text-xs" style={{ color: "var(--mf-text)" }}>
        参照した支出（{sources.length}件）
      </p>
      <ul className="space-y-1.5">
        {sources.map((source) => (
          <li key={source.id} className="text-sm" style={{ color: "var(--mf-text)" }}>
            <span style={{ color: "var(--mf-text-strong)" }}>
              {source.date} · {source.category} · {formatYen(source.amount)}
            </span>
            {source.description && (
              <span style={{ color: "var(--mf-text)" }}>
                {" "}
                — {source.description}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
