"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";

type NavItem = {
  href: string;
  label: string;
  Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
};

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

function ListIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <line x1="8" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <line x1="8" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </svg>
  );
}

function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-9 8.32 9 9 0 0 1-3.8-.7L3 21l1.9-4.2A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5z" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { href: "/", label: "ホーム", Icon: HomeIcon },
  { href: "/expenses", label: "支出一覧", Icon: ListIcon },
  { href: "/chat", label: "家計相談", Icon: ChatIcon },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t mm-divider sm:hidden"
      style={{
        backgroundColor: "var(--mf-surface)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-label="メインナビゲーション"
    >
      <ul className="grid grid-cols-3">
        {navItems.map(({ href, label, Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium"
                style={{
                  color: isActive
                    ? "var(--mf-orange-text)"
                    : "var(--mf-text)",
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
