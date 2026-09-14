import {
  byFilingDate,
  cutoff,
  UnknownTickerError,
  type CompanyFilings,
  type FilingOrder,
} from "@/server/domain";
import { cikForTicker, getCompanyFilings } from "@/server/integrations/edgar";
import { decodeCursor, encodeCursor, InvalidCursorError } from "@/server/lib/cursor";

export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 200;

export type FilingsQuery = {
  forms?: string[];
  limit?: number;
  cursor?: string;
  order?: FilingOrder;
  now?: Date;
};

export async function filingsForTicker(
  ticker: string,
  { forms, limit = DEFAULT_LIMIT, cursor, order = "desc", now = new Date() }: FilingsQuery = {},
): Promise<CompanyFilings> {
  const cik = await cikForTicker(ticker);
  if (!cik) throw new UnknownTickerError([ticker]);

  const since = cutoff(now);
  const { company, filings } = await getCompanyFilings(cik, {
    since,
    forms: forms?.length ? new Set(forms.map((f) => f.toUpperCase())) : undefined,
  });

  filings.sort(byFilingDate(order));

  // Accession numbers are unique across EDGAR, so a cursor from another query
  // isn't in this list.
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
