import { byFilingDate, cutoff, UnknownTickerError, type Company } from "@/server/domain";
import { cikForTicker, getCompanyFilings } from "@/server/integrations/edgar";

export type CompanySummary = {
  company: Company;
  // Key order is not meaningful: form names like "4" and "144" are
  // integer-like, so JS always iterates them numerically first.
  counts: Record<string, number>;
  // Searched across all of EDGAR's inline history, not just the count window.
  latest10K: string | null;
};

export type FilingsSummary = {
  since: string;
  companies: CompanySummary[];
};

export const MAX_COMPANIES = 10;

export class TooManyCompaniesError extends Error {
  constructor(readonly count: number) {
    super(`Too many companies: ${count} distinct tickers, limit is ${MAX_COMPANIES}`);
    this.name = "TooManyCompaniesError";
  }
}

export async function summariseCompanies(
  tickers: string[],
  now = new Date(),
): Promise<FilingsSummary> {
  const wanted = [...new Set(tickers.map((t) => t.toUpperCase()))];
  if (wanted.length > MAX_COMPANIES) throw new TooManyCompaniesError(wanted.length);

  const resolved = await Promise.all(
    wanted.map(async (ticker) => ({ ticker, cik: await cikForTicker(ticker) })),
  );

  const unknown = resolved.filter((r) => !r.cik).map((r) => r.ticker);
  if (unknown.length) throw new UnknownTickerError(unknown);

  const since = cutoff(now);
  const companies = await Promise.all(
    resolved.map(async ({ cik }) => {
      const { company, filings } = await getCompanyFilings(cik!, {});
      filings.sort(byFilingDate("desc"));

      const counts: Record<string, number> = {};
      for (const f of filings) {
        if (f.filingDate >= since) counts[f.form] = (counts[f.form] ?? 0) + 1;
      }

      return {
        company,
        counts,
        latest10K: filings.find((f) => f.form === "10-K")?.filingDate ?? null,
      };
    }),
  );

  return { since, companies };
}
