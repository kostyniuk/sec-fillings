import type { Company, Filing } from "@/server/domain";
import { edgar } from "./client";
import { padCik, toCompany, toFilings, type FilingSelection } from "./mappers";
import { parseCompanyTickers, parseSubmissions } from "./schemas";

export { EdgarShapeError } from "./schemas";
export { padCik, type FilingSelection } from "./mappers";

// One ~800KB file covering every registrant, so it's fetched once per process.
let cachedTickerIndex: Promise<Map<string, string>> | undefined;

function loadTickerIndex(): Promise<Map<string, string>> {
  cachedTickerIndex ??= edgar
    .companyTickers()
    .then((raw) => {
      const parsed = parseCompanyTickers(raw);
      return new Map(
        Object.values(parsed).map((e) => [e.ticker.toUpperCase(), padCik(e.cik_str)]),
      );
    })
    .catch((err) => {
      cachedTickerIndex = undefined; // don't cache a failure
      throw err;
    });

  return cachedTickerIndex;
}

export function resetTickerIndex(): void {
  cachedTickerIndex = undefined;
}

export async function cikForTicker(ticker: string): Promise<string | null> {
  const index = await loadTickerIndex();
  return index.get(ticker.toUpperCase()) ?? null;
}

export async function getCompanyFilings(
  cik: string,
  select: FilingSelection,
): Promise<{ company: Company; filings: Filing[] }> {
  const res = parseSubmissions(await edgar.submissions(padCik(cik)));

  return {
    company: toCompany(res),
    filings: toFilings(res.filings.recent, select),
  };
}
