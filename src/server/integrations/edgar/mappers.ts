import type { Company, Filing } from "@/server/domain";
import { EdgarShapeError, type FilingColumns, type SubmissionsResponse } from "./schemas";

// EDGAR pads CIKs to 10 digits in URLs; ours arrive unpadded from the ticker map.
export function padCik(cik: string | number): string {
  const digits = String(cik);
  if (!/^\d{1,10}$/.test(digits)) {
    throw new Error(`Not a valid CIK: ${JSON.stringify(cik)}`);
  }
  return digits.padStart(10, "0");
}

// Columns EDGAR and Filing name identically; everything else is converted below.
const COPIED = [
  "accessionNumber",
  "filingDate",
  "reportDate",
  "acceptanceDateTime",
  "act",
  "form",
  "fileNumber",
  "filmNumber",
  "items",
  "size",
  "primaryDocument",
  "primaryDocDescription",
] as const satisfies readonly (keyof Filing & keyof FilingColumns)[];

type CopiedKey = (typeof COPIED)[number];

const copied = (columns: FilingColumns, i: number) =>
  Object.fromEntries(COPIED.map((key) => [key, columns[key][i]])) as Pick<
    Filing,
    CopiedKey
  >;

// Index alignment is the only thing tying the columns together, so a length
// mismatch makes the payload unusable rather than merely surprising.
export function toFilings(columns: FilingColumns, since: string): Filing[] {
  const count = columns.accessionNumber.length;

  for (const [key, values] of Object.entries(columns)) {
    if (values.length !== count) {
      throw new EdgarShapeError(
        "submissions",
        `column "${key}" has ${values.length} rows, expected ${count}`,
      );
    }
  }

  const filings: Filing[] = [];

  for (let i = 0; i < count; i++) {
    // Both sides are YYYY-MM-DD, so lexical order is chronological order.
    if (columns.filingDate[i] < since) continue;

    filings.push({
      ...copied(columns, i),
      coreType: columns.core_type[i],
      isXBRL: Boolean(columns.isXBRL[i]),
      isInlineXBRL: Boolean(columns.isInlineXBRL[i]),
      isXBRLNumeric:
        columns.isXBRLNumeric[i] === null ? null : Boolean(columns.isXBRLNumeric[i]),
    });
  }

  return filings;
}

export const toCompany = (res: SubmissionsResponse): Company => ({
  cik: res.cik,
  name: res.name,
  tickers: res.tickers,
  exchanges: res.exchanges,
  sic: res.sic,
  sicDescription: res.sicDescription,
  entityType: res.entityType,
});
