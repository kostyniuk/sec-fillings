import { treaty } from "@elysiajs/eden";
import type { App } from "@/server";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (typeof window === "undefined" ? "http://localhost:3000" : window.location.origin);

export const api = treaty<App>(baseUrl).api;
