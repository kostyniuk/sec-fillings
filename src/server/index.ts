import { Elysia, t } from "elysia";

export const app = new Elysia({ prefix: "/api" })
  .get("/health", () => ({ ok: true, at: new Date().toISOString() }))
  .post(
    "/echo",
    ({ body }) => ({ echo: body.message }),
    { body: t.Object({ message: t.String() }) },
  );

export type App = typeof app;
