import { describe, expect, it } from "bun:test";
import { app } from "@/server";
import type { FilingsSummary } from "@/server/services/summary";
import { ARCHIVED_DAYS } from "./fixtures/edgar";
import { installEdgarStub } from "./helpers/edgar";

installEdgarStub();

const call = (path: string) => app.handle(new Request(`http://localhost${path}`));

const summary = async (qs: string) => {
  const res = await call(`/api/filings/summary${qs}`);
  return { res, body: (await res.json()) as FilingsSummary };
};

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

describe("GET /api/filings/summary", () => {
  it("counts filings per form inside the 12-month window", async () => {
    const { res, body } = await summary("?ticker=AAPL");

    expect(res.status).toBe(200);
    expect(body.since).toBe(
      new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().slice(0, 10),
    );
    // The fixture's third row is 800 days old, so the 10-K is not counted.
    expect(body.companies[0].counts).toEqual({ "4": 1, "10-Q": 1 });
  });

  it("reports the latest 10-K even when it predates the count window", async () => {
    const { body } = await summary("?ticker=AAPL");

    expect(body.companies[0].latest10K?.filingDate).toBe(daysAgo(ARCHIVED_DAYS));
    expect(body.companies[0].counts["10-K"]).toBeUndefined();
  });

  it("links the latest 10-K to its document on EDGAR", async () => {
    const { body } = await summary("?ticker=AAPL");

    expect(body.companies[0].latest10K?.url).toBe(
      "https://www.sec.gov/Archives/edgar/data/320193/000032019324000001/aapl-20240928.htm",
    );
  });

  it("returns null when a company has filed no 10-K", async () => {
    const { body } = await summary("?ticker=NVDA");

    expect(body.companies[0].company.name).toBe("NVIDIA CORP");
    expect(body.companies[0].latest10K).toBeNull();
  });

  it("summarises several companies at once", async () => {
    const { body } = await summary("?ticker=AAPL&ticker=NVDA");

    expect(body.companies.map((c) => c.company.tickers[0])).toEqual(["AAPL", "NVDA"]);
  });

  it("treats a repeated ticker as one company", async () => {
    const { body } = await summary("?ticker=AAPL&ticker=aapl");

    expect(body.companies).toHaveLength(1);
  });

  it("404s naming every ticker it could not resolve", async () => {
    const res = await call("/api/filings/summary?ticker=AAPL&ticker=ZZZZ&ticker=QQQQ");

    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe(
      'No SEC registrant found for tickers "ZZZZ", "QQQQ"',
    );
  });

  it("422s when no ticker is given", async () => {
    expect((await call("/api/filings/summary")).status).toBe(422);
  });

  it("422s above the cap on distinct companies", async () => {
    const qs = Array.from({ length: 11 }, (_, i) => `ticker=T${i}`).join("&");
    const res = await call(`/api/filings/summary?${qs}`);

    expect(res.status).toBe(422);
    expect((await res.json()).error).toMatch(/11 distinct tickers/);
  });

  it("counts repeats of one ticker against the cap only once", async () => {
    const qs = Array.from({ length: 11 }, () => "ticker=AAPL").join("&");
    const { res, body } = await summary(`?${qs}`);

    expect(res.status).toBe(200);
    expect(body.companies).toHaveLength(1);
  });
});
