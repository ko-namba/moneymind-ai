import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b mm-divider"
      style={{ backgroundColor: "var(--mf-surface)" }}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between mm-divider px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: "var(--mf-orange)" }}
          >
            ¥
          </span>
          <span className="text-lg font-bold tracking-tight">
            <span style={{ color: "var(--mf-orange-text)" }}>Money</span>
            <span style={{ color: "var(--mf-text-strong)" }}>Mind</span>
          </span>
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}
