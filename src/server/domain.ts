export type Filing = {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  acceptanceDateTime: string;
  act: string;
  form: string;
  fileNumber: string;
  filmNumber: string;
  items: string;
  coreType: string;
  size: number;
  isXBRL: boolean;
  isInlineXBRL: boolean;
  isXBRLNumeric: boolean | null;
  primaryDocument: string;
  primaryDocDescription: string;
};

export type Company = {
  cik: string;
  name: string;
  tickers: string[];
  exchanges: string[];
  sic: string;
  sicDescription: string;
  entityType: string;
};

export type CompanyFilings = {
  company: Company;
  since: string;
  filings: Filing[];
  page: {
    limit: number;
    nextCursor: string | null;
  };
};

export class UnknownTickerError extends Error {
  constructor(readonly tickers: string[]) {
    const quoted = tickers.map((t) => `"${t}"`).join(", ");
    super(
      tickers.length === 1
        ? `No SEC registrant found for ticker ${quoted}`
        : `No SEC registrant found for tickers ${quoted}`,
    );
    this.name = "UnknownTickerError";
  }
}

// `recent` holds 1,000 filings or one year, whichever is more, so it can reach back a decade.
const WINDOW_MONTHS = 12;

export function cutoff(now: Date): string {
  const from = new Date(now);
  from.setMonth(from.getMonth() - WINDOW_MONTHS);
  return from.toISOString().slice(0, 10);
}

export type FilingOrder = "asc" | "desc";

// EDGAR makes no promise about ties, and keyset paging needs a total order.
export const byFilingDate =
  (order: FilingOrder) =>
  (a: Filing, b: Filing) => {
    const [x, y] = order === "desc" ? [b, a] : [a, b];
    return (
      x.filingDate.localeCompare(y.filingDate) ||
      x.accessionNumber.localeCompare(y.accessionNumber)
    );
  };
