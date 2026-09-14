import { MAX_COMPANIES } from "@/lib/limits";
import { TICKERS } from "@/lib/tickers";

export const SUGGESTED_TICKERS = ["AAPL", "MSFT", "NVDA"];

export function parseSummaryParams(raw: { ticker?: string | string[] }) {
  const requested = raw.ticker === undefined ? [] : [raw.ticker].flat();
  const known = new Set(TICKERS.map((t) => t.ticker));

  return {
    tickers: [...new Set(requested.map((t) => t.toUpperCase()))]
      .filter((t) => known.has(t))
      .slice(0, MAX_COMPANIES),
  };
}

export function toSummarySearchParams(tickers: string[]): URLSearchParams {
  const search = new URLSearchParams();
  for (const ticker of tickers) search.append("ticker", ticker);
  return search;
}
