import { t, type Static } from "elysia";
import { Value } from "@sinclair/typebox/value";

// Column-oriented: every key is an array, index i is one filing.
const FilingColumns = t.Object({
  accessionNumber: t.Array(t.String()),
  filingDate: t.Array(t.String()),
  reportDate: t.Array(t.String()),
  acceptanceDateTime: t.Array(t.String()),
  act: t.Array(t.String()),
  form: t.Array(t.String()),
  fileNumber: t.Array(t.String()),
  filmNumber: t.Array(t.String()),
  items: t.Array(t.String()),
  core_type: t.Array(t.String()),
  size: t.Array(t.Number()),
  isXBRL: t.Array(t.Number()),
  isInlineXBRL: t.Array(t.Number()),
  isXBRLNumeric: t.Array(t.Union([t.Number(), t.Null()])),
  primaryDocument: t.Array(t.String()),
  primaryDocDescription: t.Array(t.String()),
});

const SubmissionsResponse = t.Object({
  cik: t.String(),
  name: t.String(),
  tickers: t.Array(t.String()),
  exchanges: t.Array(t.String()),
  sic: t.String(),
  sicDescription: t.String(),
  entityType: t.String(),
  filings: t.Object({
    recent: FilingColumns,
  }),
});

const CompanyTickersResponse = t.Record(
  t.String(),
  t.Object({
    cik_str: t.Number(),
    ticker: t.String(),
    title: t.String(),
  }),
);

export type SubmissionsResponse = Static<typeof SubmissionsResponse>;
export type FilingColumns = Static<typeof FilingColumns>;
export type CompanyTickersResponse = Static<typeof CompanyTickersResponse>;

export class EdgarShapeError extends Error {
  constructor(what: string, detail: string) {
    super(`Unexpected EDGAR response for ${what}: ${detail}`);
    this.name = "EdgarShapeError";
  }
}

function parse<T>(schema: Parameters<typeof Value.Check>[0], what: string, data: unknown): T {
  if (!Value.Check(schema, data)) {
    const first = [...Value.Errors(schema, data)][0];
    throw new EdgarShapeError(what, first ? `${first.path} ${first.message}` : "unknown");
  }
  return data as T;
}

export const parseSubmissions = (data: unknown) =>
  parse<SubmissionsResponse>(SubmissionsResponse, "submissions", data);

export const parseCompanyTickers = (data: unknown) =>
  parse<CompanyTickersResponse>(CompanyTickersResponse, "company_tickers", data);
