import { afterEach, beforeEach, mock } from "bun:test";
import { resetTickerIndex } from "@/server/integrations/edgar";
import { appleSubmissions, companyTickers } from "../fixtures/edgar";

const realFetch = globalThis.fetch;

// Any URL without a fixture throws, so a stray real network call fails loudly.
export function stubEdgar(overrides: Record<string, () => Response> = {}) {
  globalThis.fetch = mock(async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);

    for (const [match, respond] of Object.entries(overrides)) {
      if (url.includes(match)) return respond();
    }
    if (url.includes("/files/company_tickers.json")) return Response.json(companyTickers);
    if (url.includes("/submissions/CIK0000320193.json")) {
      return Response.json(appleSubmissions);
    }
    throw new Error(`Unexpected fetch in test: ${url}`);
  }) as unknown as typeof fetch;
}

// Fresh stub and empty ticker cache per test, real fetch restored after.
export function installEdgarStub() {
  beforeEach(() => {
    resetTickerIndex();
    stubEdgar();
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });
}
