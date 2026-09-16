import { describe, expect, it } from "bun:test";
import { padCik, toCompany, toFilings } from "@/server/integrations/edgar/mappers";
import { EdgarShapeError } from "@/server/integrations/edgar/schemas";
import { appleSubmissions, recentColumns } from "./fixtures/edgar";

const EPOCH = "1970-01-01";
const CIK = appleSubmissions.cik;
const zip = (select: Parameters<typeof toFilings>[1], columns = recentColumns) =>
  toFilings(columns, select, CIK);

describe("padCik", () => {
  it("zero-pads to ten digits", () => {
    expect(padCik(320193)).toBe("0000320193");
    expect(padCik("1045810")).toBe("0001045810");
  });

  it("leaves an already-padded CIK alone", () => {
    expect(padCik("0000320193")).toBe("0000320193");
  });

  it("rejects anything that is not a CIK", () => {
    expect(() => padCik("abc")).toThrow(/Not a valid CIK/);
    expect(() => padCik("")).toThrow(/Not a valid CIK/);
    expect(() => padCik("00003201930")).toThrow(/Not a valid CIK/);
  });
});

describe("toFilings", () => {
  it("zips columns into rows, preserving index alignment", () => {
    const filings = zip({ since: EPOCH });

    expect(filings).toHaveLength(3);
    expect(filings.map((f) => f.accessionNumber)).toEqual(
      recentColumns.accessionNumber,
    );
    expect(filings.map((f) => f.form)).toEqual(["4", "10-Q", "10-K"]);
    expect(filings[1].primaryDocument).toBe("aapl-20260627.htm");
    expect(filings[1].size).toBe(8_123_456);
    expect(filings[1].url).toBe(
      "https://www.sec.gov/Archives/edgar/data/320193/000032019326000081/aapl-20260627.htm",
    );
  });

  it("renames core_type and converts the XBRL flags", () => {
    const [form4, tenQ] = zip({ since: EPOCH });

    expect(form4.coreType).toBe("4");
    expect(form4.isXBRL).toBe(false);
    expect(form4.isInlineXBRL).toBe(false);
    expect(form4.isXBRLNumeric).toBe(false);

    expect(tenQ.coreType).toBe("10-Q");
    expect(tenQ.isXBRL).toBe(true);
    // null is distinct from false: EDGAR uses it for "not applicable".
    expect(tenQ.isXBRLNumeric).toBeNull();
  });

  it("drops filings older than the cutoff", () => {
    const cutoff = new Date(Date.now() - 365 * 86_400_000).toISOString().slice(0, 10);
    const filings = zip({ since: cutoff });

    expect(filings).toHaveLength(2);
    expect(filings.every((f) => f.filingDate >= cutoff)).toBe(true);
    expect(filings.map((f) => f.form)).not.toContain("10-K");
  });

  it("keeps a filing landing exactly on the cutoff", () => {
    const cutoff = recentColumns.filingDate[1];
    const filings = zip({ since: cutoff });

    expect(filings.map((f) => f.filingDate)).toContain(cutoff);
  });

  it("keeps only the requested forms, case-insensitively", () => {
    const forms = new Set(["10-q"].map((f) => f.toUpperCase()));
    const filings = zip({ since: EPOCH, forms });

    expect(filings.map((f) => f.form)).toEqual(["10-Q"]);
  });

  it("rejects misaligned columns instead of zipping garbage", () => {
    const broken = { ...recentColumns, form: ["4"] };

    expect(() => zip({ since: EPOCH }, broken)).toThrow(EdgarShapeError);
    expect(() => zip({ since: EPOCH }, broken)).toThrow(/column "form" has 1 rows/);
  });
});

describe("toCompany", () => {
  it("picks the company fields off the submissions payload", () => {
    expect(toCompany(appleSubmissions)).toEqual({
      cik: "0000320193",
      name: "Apple Inc.",
      tickers: ["AAPL"],
      exchanges: ["Nasdaq"],
      sic: "3571",
      sicDescription: "Electronic Computers",
      entityType: "operating",
    });
  });
});
