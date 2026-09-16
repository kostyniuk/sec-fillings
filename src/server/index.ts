import { Elysia } from "elysia";
import { EdgarShapeError } from "./integrations/edgar";
import { InvalidCursorError } from "./lib/cursor";
import { HttpError } from "./lib/http";
import { companies } from "./routes/companies";
import { debugEdgar } from "./routes/debug-edgar";
import { filings } from "./routes/filings";
import { health } from "./routes/health";
import { UnknownTickerError } from "./domain";
import { TooManyCompaniesError } from "./services/summary";

export const app = new Elysia({ prefix: "/api" })
  .error({ UnknownTickerError, EdgarShapeError, HttpError, InvalidCursorError, TooManyCompaniesError })
  .onError(({ code, error, set }) => {
    switch (code) {
      case "UnknownTickerError":
        set.status = 404;
        return { error: error.message };
      case "InvalidCursorError":
        set.status = 400;
        return { error: error.message };
      case "TooManyCompaniesError":
        set.status = 422;
        return { error: error.message };
      case "HttpError":
        set.status = 502;
        return { error: `SEC request failed (${error.status})` };
      case "EdgarShapeError":
        set.status = 502;
        return { error: error.message };
    }
  })
  .use(health)
  .use(debugEdgar)
  .use(companies)
  .use(filings);

export type App = typeof app;
