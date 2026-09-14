"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { MultiSelect } from "@/components/filings/multi-select";
import { MAX_COMPANIES } from "@/lib/limits";
import { parseSummaryParams, toSummarySearchParams } from "@/lib/summary-params";
import { TICKERS } from "@/lib/tickers";

export function CompanyFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const { tickers } = parseSummaryParams({ ticker: searchParams.getAll("ticker") });

  return (
    <MultiSelect
      options={TICKERS.map((t) => ({ value: t.ticker, hint: t.name }))}
      value={tickers}
      disabled={isPending}
      max={MAX_COMPANIES}
      placeholder="Select companies"
      selectedLabel={(n) => `${n} of ${MAX_COMPANIES} companies`}
      searchLabel="Search ticker…"
      emptyLabel="No company found."
      onChange={(next) =>
        startTransition(() =>
          router.replace(`/summary?${toSummarySearchParams(next)}`, { scroll: false }),
        )
      }
    />
  );
}
