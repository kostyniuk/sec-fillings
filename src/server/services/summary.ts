import {
  byFilingDate,
  cutoff,
  filingUrl,
  UnknownTickerError,
  type Company,
} from "@/server/domain";
import {
  cikForTicker,
  getCompanyFilings,
  type EdgarDeps,
} from "@/server/integrations/edgar";
import { MAX_COMPANIES } from "@/lib/limits";

export type CompanySummary = {
  company: Company;
  // Key order is not meaningful: form names like "4" and "144" are
  // integer-like, so JS always iterates them numerically first.
  counts: Record<string, number>;
  // Searched across all of EDGAR's inline history, not just the count window.
  latest10K: { filingDate: string; accessionNumber: string; url: string } | null;
};

export type FilingsSummary = {
  since: string;
  companies: CompanySummary[];
};

export class TooManyCompaniesError extends Error {
  constructor(readonly count: number) {
    super(`Too many companies: ${count} distinct tickers, limit is ${MAX_COMPANIES}`);
    this.name = "TooManyCompaniesError";
  }
}

export async function summariseCompanies(
  tickers: string[],
  now = new Date(),
  deps: EdgarDeps = {},
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
      const { company, filings } = await getCompanyFilings(cik!, {}, deps);
      filings.sort(byFilingDate("desc"));

      const counts: Record<string, number> = {};
      for (const f of filings) {
        if (f.filingDate >= since) counts[f.form] = (counts[f.form] ?? 0) + 1;
      }

      const latest = filings.find((f) => f.form === "10-K");

      return {
        company,
        counts,
        latest10K: latest
          ? {
              filingDate: latest.filingDate,
              accessionNumber: latest.accessionNumber,
              url: filingUrl(company.cik, latest.accessionNumber, latest.primaryDocument),
            }
          : null,
      };
    }),
  );

  return { since, companies };
}
