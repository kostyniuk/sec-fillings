import { Elysia } from "elysia";
import { companies } from "./routes/companies";
import { health } from "./routes/health";

export const app = new Elysia({ prefix: "/api" }).use(health).use(companies);

export type App = typeof app;
