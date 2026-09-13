// Shapes mirror the real EDGAR payloads. Dates are relative to today so the
// 12-month window stays meaningful over time.

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

export const RECENT_DAYS = 2;
export const OLDER_DAYS = 40;
export const ARCHIVED_DAYS = 800;

const rows = [
  {
    accessionNumber: "0001140361-26-036226",
    filingDate: daysAgo(RECENT_DAYS),
    reportDate: daysAgo(RECENT_DAYS + 2),
    acceptanceDateTime: `${daysAgo(RECENT_DAYS)}T22:30:31.000Z`,
    act: "",
    form: "4",
    fileNumber: "",
    filmNumber: "",
    items: "",
    core_type: "4",
    size: 4681,
    isXBRL: 0,
    isInlineXBRL: 0,
    isXBRLNumeric: 0,
    primaryDocument: "xslF345X06/form4.xml",
    primaryDocDescription: "FORM 4",
  },
  {
    accessionNumber: "0000320193-26-000081",
    filingDate: daysAgo(OLDER_DAYS),
    reportDate: daysAgo(OLDER_DAYS + 5),
    acceptanceDateTime: `${daysAgo(OLDER_DAYS)}T18:02:11.000Z`,
    act: "34",
    form: "10-Q",
    fileNumber: "001-36743",
    filmNumber: "261000123",
    items: "",
    core_type: "10-Q",
    size: 8_123_456,
    isXBRL: 1,
    isInlineXBRL: 1,
    isXBRLNumeric: null,
    primaryDocument: "aapl-20260627.htm",
    primaryDocDescription: "10-Q",
  },
  {
    accessionNumber: "0000320193-24-000001",
    filingDate: daysAgo(ARCHIVED_DAYS),
    reportDate: daysAgo(ARCHIVED_DAYS + 30),
    acceptanceDateTime: `${daysAgo(ARCHIVED_DAYS)}T12:00:00.000Z`,
    act: "34",
    form: "10-K",
    fileNumber: "001-36743",
    filmNumber: "241000001",
    items: "",
    core_type: "10-K",
    size: 9_000_000,
    isXBRL: 1,
    isInlineXBRL: 1,
    isXBRLNumeric: 1,
    primaryDocument: "aapl-20240928.htm",
    primaryDocDescription: "10-K",
  },
];

export type Row = (typeof rows)[number];
type Columns = { [K in keyof Row]: Row[K][] };

const toColumns = (source: Row[]): Columns =>
  Object.fromEntries(
    (Object.keys(source[0]) as (keyof Row)[]).map((key) => [
      key,
      source.map((r) => r[key]),
    ]),
  ) as Columns;

export const recentColumns = toColumns(rows);

export const companyTickers = {
  "0": { cik_str: 320193, ticker: "AAPL", title: "Apple Inc." },
  "1": { cik_str: 1045810, ticker: "NVDA", title: "NVIDIA CORP" },
};

export const appleSubmissions = {
  cik: "0000320193",
  name: "Apple Inc.",
  tickers: ["AAPL"],
  exchanges: ["Nasdaq"],
  sic: "3571",
  sicDescription: "Electronic Computers",
  entityType: "operating",
  filings: {
    recent: recentColumns,
    // Still present upstream; the app no longer reads it.
    files: [
      {
        name: "CIK0000320193-submissions-001.json",
        filingCount: 1247,
        filingFrom: "1994-01-26",
        filingTo: "2015-07-22",
      },
    ],
  },
};

export const makeRow = (over: Partial<Row> & Pick<Row, "accessionNumber" | "filingDate">): Row => ({
  ...rows[0],
  ...over,
});

export const makeSubmissions = (source: Row[]) => ({
  ...appleSubmissions,
  filings: { ...appleSubmissions.filings, recent: toColumns(source) },
});

export const nvidiaSubmissions = {
  ...appleSubmissions,
  cik: "0001045810",
  name: "NVIDIA CORP",
  tickers: ["NVDA"],
  filings: {
    ...appleSubmissions.filings,
    recent: toColumns([
      makeRow({ accessionNumber: "0001045810-26-000010", filingDate: daysAgo(3) }),
      makeRow({ accessionNumber: "0001045810-26-000011", filingDate: daysAgo(9) }),
    ]),
  },
};
