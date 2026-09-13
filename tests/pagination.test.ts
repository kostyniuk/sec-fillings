import { describe, expect, it } from "bun:test";
import { filingsForTicker } from "@/server/services/filings";
import { makeRow, makeSubmissions, type Row } from "./fixtures/edgar";
import { installEdgarStub, stubEdgar } from "./helpers/edgar";

installEdgarStub();

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

const serve = (rows: Row[]) =>
  stubEdgar({ "/submissions/": () => Response.json(makeSubmissions(rows)) });

const walk = async (query: Parameters<typeof filingsForTicker>[1] = {}) => {
  const seen: string[] = [];
  let cursor: string | null = null;
  let pages = 0;

  do {
    const res = await filingsForTicker("AAPL", { ...query, cursor: cursor ?? undefined });
    seen.push(...res.filings.map((f) => f.accessionNumber));
    cursor = res.page.nextCursor;
    pages++;
  } while (cursor && pages < 20);

  return { seen, pages };
};

describe("cursor paging", () => {
  it("breaks ties between filings submitted on the same day", async () => {
    const filingDate = daysAgo(3);
    serve([
      makeRow({ accessionNumber: "0000000000-26-000001", filingDate }),
      makeRow({ accessionNumber: "0000000000-26-000002", filingDate }),
      makeRow({ accessionNumber: "0000000000-26-000003", filingDate }),
    ]);

    const { seen, pages } = await walk({ limit: 1 });

    expect(pages).toBe(3);
    expect(seen).toEqual([
      "0000000000-26-000003",
      "0000000000-26-000002",
      "0000000000-26-000001",
    ]);
  });

  it("keeps the form filter applied across every page", async () => {
    serve([
      makeRow({ accessionNumber: "a-1", filingDate: daysAgo(1), form: "10-K" }),
      makeRow({ accessionNumber: "a-2", filingDate: daysAgo(2), form: "8-K" }),
      makeRow({ accessionNumber: "a-3", filingDate: daysAgo(3), form: "10-K" }),
      makeRow({ accessionNumber: "a-4", filingDate: daysAgo(4), form: "8-K" }),
    ]);

    const { seen } = await walk({ limit: 1, forms: ["10-K"] });

    expect(seen).toEqual(["a-1", "a-3"]);
  });

  it("returns no cursor when the last page is exactly full", async () => {
    serve([
      makeRow({ accessionNumber: "b-1", filingDate: daysAgo(1) }),
      makeRow({ accessionNumber: "b-2", filingDate: daysAgo(2) }),
    ]);

    const res = await filingsForTicker("AAPL", { limit: 2 });

    expect(res.filings).toHaveLength(2);
    expect(res.page.nextCursor).toBeNull();
  });
});
