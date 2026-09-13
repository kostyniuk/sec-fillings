import { env } from "@/server/lib/env";
import { HttpError, rateLimited } from "@/server/lib/http";

const DATA_BASE = "https://data.sec.gov";
// Ticker reference data lives on the main site, not data.sec.gov.
const WWW_BASE = "https://www.sec.gov";

async function get(url: string): Promise<unknown> {
  const res = await rateLimited(() =>
    fetch(url, {
      headers: {
        "User-Agent": env.SEC_USER_AGENT,
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
    }),
  );

  if (!res.ok) throw new HttpError(res.status, url);
  return res.json();
}

export const edgar = {
  submissions: (cik: string) => get(`${DATA_BASE}/submissions/CIK${cik}.json`),
  companyTickers: () => get(`${WWW_BASE}/files/company_tickers.json`),
};
