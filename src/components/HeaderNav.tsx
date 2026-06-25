"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/expenses", label: "支出一覧" },
  { href: "/chat", label: "家計相談" },
] as const;

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1.5 sm:gap-2">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mm-nav-link ${isActive ? "mm-nav-link-active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
