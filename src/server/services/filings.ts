import type { CompanyFilings, Filing } from "@/server/domain";
import { cikForTicker, getCompanyFilings } from "@/server/integrations/edgar";
import { decodeCursor, encodeCursor, InvalidCursorError } from "@/server/lib/cursor";

export class UnknownTickerError extends Error {
  constructor(readonly ticker: string) {
    super(`No SEC registrant found for ticker "${ticker}"`);
    this.name = "UnknownTickerError";
  }
}

// `recent` holds 1,000 filings or one year, whichever is more, so it can reach back a decade.
const WINDOW_MONTHS = 12;

export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 200;

export type FilingsQuery = {
  forms?: string[];
  limit?: number;
  cursor?: string;
  now?: Date;
};

function cutoff(now: Date): string {
  const from = new Date(now);
  from.setMonth(from.getMonth() - WINDOW_MONTHS);
  return from.toISOString().slice(0, 10);
}

// EDGAR returns newest-first but makes no promise about ties, and keyset paging
// needs a total order or pages can repeat or drop rows.
const newestFirst = (a: Filing, b: Filing) =>
  b.filingDate.localeCompare(a.filingDate) ||
  b.accessionNumber.localeCompare(a.accessionNumber);

export async function filingsForTicker(
  ticker: string,
  { forms, limit = DEFAULT_LIMIT, cursor, now = new Date() }: FilingsQuery = {},
): Promise<CompanyFilings> {
  const cik = await cikForTicker(ticker);
  if (!cik) throw new UnknownTickerError(ticker);

  const since = cutoff(now);
  const { company, filings } = await getCompanyFilings(cik, {
    since,
    forms: forms?.length ? new Set(forms.map((f) => f.toUpperCase())) : undefined,
  });

  filings.sort(newestFirst);

  // Accession numbers are unique across EDGAR, so a cursor from another ticker
  // or form filter simply isn't in this list.
  const at = cursor
    ? filings.findIndex((f) => f.accessionNumber === decodeCursor(cursor))
    : -1;
  if (cursor && at === -1) throw new InvalidCursorError(cursor);

  const remaining = filings.slice(at + 1);
  const page = remaining.slice(0, limit);
  const last = page.at(-1);

  return {
    company,
    since,
    filings: page,
    page: {
      limit,
      nextCursor:
        last && remaining.length > page.length
          ? encodeCursor(last.accessionNumber)
          : null,
    },
  };
}
