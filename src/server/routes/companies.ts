import { Elysia, t } from "elysia";
import { EdgarShapeError } from "@/server/integrations/edgar";
import { HttpError } from "@/server/lib/http";
import { filingsForTicker, UnknownTickerError } from "@/server/services/filings";

export const companies = new Elysia({ prefix: "/companies" })
  .error({ UnknownTickerError, EdgarShapeError, HttpError })
  .onError(({ code, error, set }) => {
    switch (code) {
      case "UnknownTickerError":
        set.status = 404;
        return { error: error.message };
      case "HttpError":
        set.status = 502;
        return { error: `SEC request failed (${error.status})` };
      case "EdgarShapeError":
        set.status = 502;
        return { error: error.message };
    }
  })
  .get("/:ticker/filings", async ({ params }) => await filingsForTicker(params.ticker), {
    params: t.Object({
      ticker: t.String({ minLength: 1, maxLength: 10, pattern: "^[A-Za-z0-9.\\-]+$" }),
    }),
  });
