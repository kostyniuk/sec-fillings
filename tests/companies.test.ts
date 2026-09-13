import { describe, expect, it } from "bun:test";
import type { CompanyFilings } from "@/server/domain";
import { app } from "@/server";
import {
  ARCHIVED_DAYS,
  OLDER_DAYS,
  RECENT_DAYS,
} from "./fixtures/edgar";
import { stubEdgar, installEdgarStub } from "./helpers/edgar";

const call = (path: string) => app.handle(new Request(`http://localhost${path}`));

const getFilings = async (path: string) => {
  const res = await call(path);
  return { res, body: (await res.json()) as CompanyFilings };
};

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

installEdgarStub();

describe("GET /api/companies/:ticker/filings", () => {
  it("returns the company alongside its filings", async () => {
    const { res, body } = await getFilings("/api/companies/AAPL/filings");

    expect(res.status).toBe(200);
    expect(body.company).toEqual({
      cik: "0000320193",
      name: "Apple Inc.",
      tickers: ["AAPL"],
      exchanges: ["Nasdaq"],
      sic: "3571",
      sicDescription: "Electronic Computers",
      entityType: "operating",
    });
  });

  it("returns filings as rows, not EDGAR's parallel arrays", async () => {
    const { body } = await getFilings("/api/companies/AAPL/filings");

    expect(body.filings[0]).toEqual({
      accessionNumber: "0001140361-26-036226",
      filingDate: daysAgo(RECENT_DAYS),
      reportDate: daysAgo(RECENT_DAYS + 2),
      acceptanceDateTime: `${daysAgo(RECENT_DAYS)}T22:30:31.000Z`,
      act: "",
      form: "4",
      fileNumber: "",
      filmNumber: "",
      items: "",
      coreType: "4",
      size: 4681,
      isXBRL: false,
      isInlineXBRL: false,
      isXBRLNumeric: false,
      primaryDocument: "xslF345X06/form4.xml",
      primaryDocDescription: "FORM 4",
    });
  });

  it("covers the last 12 months and nothing older", async () => {
    const { body } = await getFilings("/api/companies/AAPL/filings");

    expect(body.since).toBe(
      new Date(new Date().setMonth(new Date().getMonth() - 12))
        .toISOString()
        .slice(0, 10),
    );
    expect(body.filings.map((f) => f.filingDate)).toEqual([
      daysAgo(RECENT_DAYS),
      daysAgo(OLDER_DAYS),
    ]);
    expect(body.filings.map((f) => f.filingDate)).not.toContain(daysAgo(ARCHIVED_DAYS));
  });

  it("does not advertise archived history it never fetches", async () => {
    const { body } = await getFilings("/api/companies/AAPL/filings");

    expect(body).not.toHaveProperty("archives");
    expect(Object.keys(body).sort()).toEqual(["company", "filings", "page", "since"]);
  });

  it("defaults to a single page with no cursor when everything fits", async () => {
    const { body } = await getFilings("/api/companies/AAPL/filings");

    expect(body.page).toEqual({ limit: 50, nextCursor: null });
  });

  it("filters by form, case-insensitively", async () => {
    const { body } = await getFilings("/api/companies/AAPL/filings?form=10-q");

    expect(body.filings.map((f) => f.form)).toEqual(["10-Q"]);
  });

  it("combines repeated form params", async () => {
    const { body } = await getFilings("/api/companies/AAPL/filings?form=4&form=10-Q");

    expect(body.filings.map((f) => f.form)).toEqual(["4", "10-Q"]);
  });

  it("walks pages by cursor without repeating or dropping rows", async () => {
    const { body: all } = await getFilings("/api/companies/AAPL/filings");
    const seen: string[] = [];
    let cursor: string | null = null;

    do {
      const path = `/api/companies/AAPL/filings?limit=1${cursor ? `&cursor=${cursor}` : ""}`;
      const { body }: { body: CompanyFilings } = await getFilings(path);

      expect(body.filings).toHaveLength(1);
      seen.push(body.filings[0].accessionNumber);
      cursor = body.page.nextCursor;
    } while (cursor);

    expect(seen).toEqual(all.filings.map((f) => f.accessionNumber));
    expect(new Set(seen).size).toBe(seen.length);
  });

  it("400s when a cursor from another ticker is reused", async () => {
    const { body } = await getFilings("/api/companies/AAPL/filings?limit=1");
    const res = await call(
      `/api/companies/NVDA/filings?limit=1&cursor=${body.page.nextCursor}`,
    );

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/does not belong to this query/);
  });

  it("400s when a cursor is reused with a different form filter", async () => {
    // Cursor points at the form-4 filing, which the 10-Q filter excludes.
    const { body } = await getFilings("/api/companies/AAPL/filings?limit=1");
    const res = await call(
      `/api/companies/AAPL/filings?form=10-Q&cursor=${body.page.nextCursor}`,
    );

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/does not belong to this query/);
  });

  it("400s on a cursor that names no filing in this list", async () => {
    const res = await call("/api/companies/AAPL/filings?cursor=not-a-cursor");

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/does not belong to this query/);
  });

  it("422s on a limit above the maximum", async () => {
    expect((await call("/api/companies/AAPL/filings?limit=999")).status).toBe(422);
  });

  it("is case-insensitive on the ticker", async () => {
    expect((await call("/api/companies/aapl/filings")).status).toBe(200);
  });

  it("404s on a ticker with no SEC registrant", async () => {
    const res = await call("/api/companies/ZZZZ/filings");

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: 'No SEC registrant found for ticker "ZZZZ"',
    });
  });

  it("422s on a malformed ticker", async () => {
    expect((await call("/api/companies/not a ticker/filings")).status).toBe(422);
  });

  it("502s when EDGAR fails", async () => {
    stubEdgar({ "/submissions/": () => new Response("nope", { status: 503 }) });
    const res = await call("/api/companies/AAPL/filings");

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "SEC request failed (503)" });
  });

  it("502s when EDGAR's payload does not match the expected shape", async () => {
    stubEdgar({
      "/submissions/": () => Response.json({ cik: "0000320193", name: "Apple Inc." }),
    });
    const res = await call("/api/companies/AAPL/filings");

    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/Unexpected EDGAR response/);
  });
});

describe("GET /api/health", () => {
  it("returns 200", async () => {
    expect((await call("/api/health")).status).toBe(200);
  });
});
