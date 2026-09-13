// SEC blocks requests that don't declare a User-Agent with real contact info.
// https://www.sec.gov/os/webmaster-faq#developers
const SEC_USER_AGENT = process.env.SEC_USER_AGENT;

if (!SEC_USER_AGENT) {
  throw new Error(
    "SEC_USER_AGENT is not set. Copy .env.example to .env.local and put your " +
      "app name and contact email in it, e.g. \"sec-fillings you@example.com\".",
  );
}

export const env = {
  SEC_USER_AGENT,
} as const;
