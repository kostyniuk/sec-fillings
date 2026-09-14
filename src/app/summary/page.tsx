import type { Metadata } from "next";
import { Suspense } from "react";
import { columns, type SummaryRow } from "@/components/summary/columns";
import { CompanyFilter } from "@/components/summary/company-filter";
import { DataTable } from "@/components/filings/data-table";
import { getSummary } from "@/lib/filings-data";
import { parseSummaryParams } from "@/lib/summary-params";

export const metadata: Metadata = {
  title: "Filing summary",
  description: "Filing volume by form type across companies, with each latest 10-K.",
};

async function SummaryView({ searchParams }: Pick<PageProps<"/summary">, "searchParams">) {
  const { tickers } = parseSummaryParams(await searchParams);
  const summary = await getSummary(tickers);

  const rows: SummaryRow[] = summary.companies.map((entry) => {
    const forms = Object.entries(entry.counts).sort(([, a], [, b]) => b - a);

    return {
      ticker: entry.company.tickers[0] ?? entry.company.cik,
      company: entry.company.name,
      total: forms.reduce((sum, [, count]) => sum + count, 0),
      forms: forms.map(([form, count]) => ({ form, count })),
      latest10KDate: entry.latest10K?.filingDate ?? null,
      latest10KUrl: entry.latest10K?.url ?? null,
    };
  });

  return (
    <>
      <DataTable columns={columns} data={rows} empty="Pick one or more companies to compare." />
      <p className="text-muted-foreground text-sm">
        Counts cover filings since {summary.since}. The 10-K is the latest EDGAR holds inline, which
        usually reaches back further.
      </p>
    </>
  );
}

export default function SummaryPage({ searchParams }: PageProps<"/summary">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Filing summary</h1>
        <p className="text-muted-foreground text-sm">
          Filing volume by form type across companies, with each one&rsquo;s latest annual report.
        </p>
      </header>

      <Suspense fallback={<div className="bg-muted/40 h-8 w-[220px] animate-pulse rounded-md" />}>
        <CompanyFilter />
      </Suspense>

      <Suspense fallback={<div className="bg-muted/40 h-64 animate-pulse rounded-lg border" />}>
        <SummaryView searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
