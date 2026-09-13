import { Elysia, t } from "elysia";
import { EdgarShapeError } from "@/server/integrations/edgar";
import { InvalidCursorError } from "@/server/lib/cursor";
import { HttpError } from "@/server/lib/http";
import {
  DEFAULT_LIMIT,
  filingsForTicker,
  MAX_LIMIT,
  UnknownTickerError,
} from "@/server/services/filings";

export const companies = new Elysia({ prefix: "/companies" })
  .error({ UnknownTickerError, EdgarShapeError, HttpError, InvalidCursorError })
  .onError(({ code, error, set }) => {
    switch (code) {
      case "UnknownTickerError":
        set.status = 404;
        return { error: error.message };
      case "InvalidCursorError":
        set.status = 400;
        return { error: error.message };
      case "HttpError":
        set.status = 502;
        return { error: `SEC request failed (${error.status})` };
      case "EdgarShapeError":
        set.status = 502;
        return { error: error.message };
    }
  })
  .get(
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
        // Repeat the param to combine forms: ?form=10-K&form=8-K
        form: t.Optional(
          t.Array(t.String({ minLength: 1, maxLength: 20 }), { default: undefined }),
        ),
        limit: t.Optional(
          t.Integer({ minimum: 1, maximum: MAX_LIMIT, default: DEFAULT_LIMIT }),
        ),
        cursor: t.Optional(t.String({ maxLength: 128 })),
      }),
    },
  );
