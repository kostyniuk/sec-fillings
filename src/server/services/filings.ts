import type { CompanyFilings } from "@/server/domain";
import { cikForTicker, getCompanyFilings } from "@/server/integrations/edgar";

export class UnknownTickerError extends Error {
  constructor(readonly ticker: string) {
    super(`No SEC registrant found for ticker "${ticker}"`);
    this.name = "UnknownTickerError";
  }
}

// `recent` holds 1,000 filings or one year, whichever is more, so it can reach back a decade.
const WINDOW_MONTHS = 12;

function cutoff(now: Date): string {
  const from = new Date(now);
  from.setMonth(from.getMonth() - WINDOW_MONTHS);
  return from.toISOString().slice(0, 10);
}

export async function filingsForTicker(
  ticker: string,
  now = new Date(),
): Promise<CompanyFilings> {
  const cik = await cikForTicker(ticker);
  if (!cik) throw new UnknownTickerError(ticker);

  return getCompanyFilings(cik, cutoff(now));
}
