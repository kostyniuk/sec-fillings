import type { FilingOrder } from "@/server/domain";

export const DEFAULT_TICKER = "AAPL";
export const DEFAULT_LIMIT = 25;
export const PAGE_SIZES = [10, 25, 50];

export type FilingsParams = {
  ticker: string;
  forms: string[];
  order: FilingOrder;
  limit: number;
  cursor?: string;
};

type RawParams = Record<string, string | string[] | undefined>;

const list = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

const single = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export function parseFilingsParams(raw: RawParams): FilingsParams {
  const limit = Number(single(raw.limit));

  return {
    ticker: (single(raw.ticker) ?? DEFAULT_TICKER).toUpperCase(),
    forms: list(raw.form),
    order: single(raw.order) === "asc" ? "asc" : "desc",
    limit: PAGE_SIZES.includes(limit) ? limit : DEFAULT_LIMIT,
    cursor: single(raw.cursor),
  };
}

export function toSearchParams(params: FilingsParams): URLSearchParams {
  const search = new URLSearchParams();

  if (params.ticker !== DEFAULT_TICKER) search.set("ticker", params.ticker);
  for (const form of params.forms) search.append("form", form);
  if (params.order !== "desc") search.set("order", params.order);
  if (params.limit !== DEFAULT_LIMIT) search.set("limit", String(params.limit));
  if (params.cursor) search.set("cursor", params.cursor);

  return search;
}
