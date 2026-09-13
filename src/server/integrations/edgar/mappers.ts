import type { Company, Filing } from "@/server/domain";
import { EdgarShapeError, type FilingColumns, type SubmissionsResponse } from "./schemas";

export function padCik(cik: string | number): string {
  const digits = String(cik);
  if (!/^\d{1,10}$/.test(digits)) {
    throw new Error(`Not a valid CIK: ${JSON.stringify(cik)}`);
  }
  return digits.padStart(10, "0");
}

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

export type FilingSelection = {
  since?: string;
  forms?: Set<string>;
};

// Index alignment is all that ties the columns together, so ragged columns
// would zip fields across filings.
function rowCount(columns: FilingColumns): number {
  const count = columns.accessionNumber.length;

  for (const [key, values] of Object.entries(columns)) {
    if (values.length !== count) {
      throw new EdgarShapeError(
        "submissions",
        `column "${key}" has ${values.length} rows, expected ${count}`,
      );
    }
  }

  return count;
}

const isSelected = (columns: FilingColumns, i: number, select: FilingSelection) =>
  // Both sides are YYYY-MM-DD, so lexical order is chronological order.
  (!select.since || columns.filingDate[i] >= select.since) &&
  (!select.forms || select.forms.has(columns.form[i].toUpperCase()));

const toFiling = (columns: FilingColumns, i: number): Filing => ({
  ...(Object.fromEntries(COPIED.map((key) => [key, columns[key][i]])) as Pick<
    Filing,
    CopiedKey
  >),
  coreType: columns.core_type[i],
  isXBRL: Boolean(columns.isXBRL[i]),
  isInlineXBRL: Boolean(columns.isInlineXBRL[i]),
  isXBRLNumeric:
    columns.isXBRLNumeric[i] === null ? null : Boolean(columns.isXBRLNumeric[i]),
});

export function toFilings(columns: FilingColumns, select: FilingSelection): Filing[] {
  const count = rowCount(columns);
  const filings: Filing[] = [];

  for (let i = 0; i < count; i++) {
    if (isSelected(columns, i, select)) filings.push(toFiling(columns, i));
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
