import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { columns } from "@/components/filings/columns";
import { DataTable } from "@/components/filings/data-table";
import { Filters } from "@/components/filings/filters";
import { Pagination } from "@/components/filings/pagination";
import { parseFilingsParams, toSearchParams } from "@/lib/filings-params";
import { getFilingsPage, getFormCounts } from "@/lib/filings-data";
import { UnknownTickerError } from "@/server/domain";
import { InvalidCursorError } from "@/server/lib/cursor";

export const metadata: Metadata = {
  title: "SEC filings",
  description: "Filings from the last 12 months, straight from EDGAR.",
};

async function FilingsView({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const params = parseFilingsParams(await searchParams);

  const [page, counts] = await Promise.all([
    getFilingsPage(params.ticker, {
      forms: params.forms,
      limit: params.limit,
      cursor: params.cursor,
      order: params.order,
    }),
    getFormCounts(params.ticker),
  ]).catch((error: unknown) => {
    if (error instanceof UnknownTickerError) notFound();
    if (error instanceof InvalidCursorError) {
      redirect(`/?${toSearchParams({ ...params, cursor: undefined })}`);
    }
    throw error;
  });

  const rows = page.filings.map((filing) => ({
    accessionNumber: filing.accessionNumber,
    filingDate: filing.filingDate,
    form: filing.form,
    company: page.company.name,
    ticker: params.ticker,
    url: filing.url,
  }));

  const formOptions = Object.entries(counts)
    .map(([form, count]) => ({ form, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <Filters formOptions={formOptions} />
      <DataTable columns={columns} data={rows} empty="No filings match these filters." />
      <Pagination nextCursor={page.page.nextCursor} />
    </>
  );
}

function Skeleton() {
  return <div className="bg-muted/40 h-[520px] animate-pulse rounded-lg border" />;
}

export default function FilingsPage({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">SEC filings</h1>
        <p className="text-muted-foreground text-sm">Filings from the last 12 months.</p>
      </header>

      <Suspense fallback={<Skeleton />}>
        <FilingsView searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
