// LOCAL ONLY. Do not commit. Proxies data.sec.gov so the browser can
// inspect raw submissions JSON (SEC 403s a direct tab).
import { Elysia, t } from "elysia";
import { padCik } from "@/server/integrations/edgar/mappers";
import { env } from "@/server/lib/env";
import { HttpError, rateLimited } from "@/server/lib/http";

const DATA_BASE = "https://data.sec.gov";

const CikParams = t.Object({
  cik: t.String({ minLength: 1, maxLength: 10, pattern: "^\\d+$" }),
});

async function proxySubmissions(file: string): Promise<unknown> {
  if (!/^CIK\d{10}(?:-submissions-\d{3})?\.json$/.test(file)) {
    throw new HttpError(400, file, `Refusing to proxy ${JSON.stringify(file)}`);
  }

  const url = `${DATA_BASE}/submissions/${file}`;
  const res = await rateLimited(() =>
    fetch(url, {
      headers: {
        "User-Agent": env.SEC_USER_AGENT,
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
    }),
  );

  if (!res.ok) throw new HttpError(res.status, url);
  return res.json();
}

export const debugEdgar = new Elysia({ prefix: "/debug/edgar" })
  .get(
    "/:cik",
    async ({ params }) => proxySubmissions(`CIK${padCik(params.cik)}.json`),
    { params: CikParams },
  )
  .get(
    "/:cik/files/:file",
    async ({ params }) => {
      const cik = padCik(params.cik);
      if (!params.file.startsWith(`CIK${cik}`)) {
        throw new HttpError(400, params.file, "Archive file does not match CIK");
      }
      return proxySubmissions(params.file);
    },
    {
      params: t.Object({
        cik: t.String({ minLength: 1, maxLength: 10, pattern: "^\\d+$" }),
        file: t.String({ minLength: 1, maxLength: 80, pattern: "^[A-Za-z0-9._-]+$" }),
      }),
    },
  );
