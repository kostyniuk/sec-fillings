import { Elysia, t } from "elysia";
import { summariseCompanies } from "@/server/services/summary";

export const filings = new Elysia({ prefix: "/filings" }).get(
  "/summary",
  async ({ query }) => await summariseCompanies(query.ticker),
  {
    query: t.Object({
      // The real cap is MAX_COMPANIES, applied after de-duplication.
      ticker: t.Array(t.String({ minLength: 1, maxLength: 10, pattern: "^[A-Za-z0-9.\\-]+$" }), {
        minItems: 1,
        maxItems: 100,
      }),
    }),
  },
);
