import { Elysia, t } from "elysia";
import { DEFAULT_LIMIT, filingsForTicker, MAX_LIMIT } from "@/server/services/filings";

export const companies = new Elysia({ prefix: "/companies" }).get(
  "/:ticker/filings",
  async ({ params, query }) =>
    await filingsForTicker(params.ticker, {
      forms: query.form,
      limit: query.limit,
      cursor: query.cursor,
    }),
  {
    params: t.Object({
      ticker: t.String({ minLength: 1, maxLength: 10, pattern: "^[A-Za-z0-9.\\-]+$" }),
    }),
    query: t.Object({
      form: t.Optional(t.Array(t.String({ minLength: 1, maxLength: 20 }))),
      limit: t.Optional(t.Integer({ minimum: 1, maximum: MAX_LIMIT, default: DEFAULT_LIMIT })),
      cursor: t.Optional(t.String({ maxLength: 128 })),
    }),
  },
);
