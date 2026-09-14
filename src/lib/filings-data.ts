import { cacheLife, cacheTag } from "next/cache";
import { edgar } from "@/server/integrations/edgar/client";
import { filingsForTicker, type FilingsQuery } from "@/server/services/filings";
import { summariseCompanies } from "@/server/services/summary";

// `next/cache` throws outside a Next build, so the directive cannot live in
// src/server -- that code also runs under bun test and standalone Elysia.
async function fetchSubmissions(cik: string): Promise<unknown> {
  "use cache";
  cacheLife("hours");
  cacheTag(`submissions:${cik}`);

  return edgar.submissions(cik);
}

const deps = { fetchSubmissions };

export const getFilingsPage = (ticker: string, query: FilingsQuery) =>
  filingsForTicker(ticker, query, deps);

export const getFormCounts = async (ticker: string) =>
  (await summariseCompanies([ticker], new Date(), deps)).companies[0]?.counts ?? {};
