"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SUGGESTED_TICKERS, toSummarySearchParams } from "@/lib/summary-params";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Filings", match: "/" },
  {
    href: `/summary?${toSummarySearchParams(SUGGESTED_TICKERS)}`,
    label: "Summary",
    match: "/summary",
  },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="mx-auto flex w-full max-w-6xl gap-1 px-6 py-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              pathname === link.match
                ? "bg-muted font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
