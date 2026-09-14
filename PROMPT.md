# AI Collaboration Prompts

This is a curated selection of the prompts I used while completing this interview task. It intentionally excludes short acknowledgements and one-line corrections, while preserving the decisions, review checkpoints, and implementation direction that shaped the work.

## 1. Understanding the assignment

> I've got this task for an interview. Can you estimate how hard it is, what domain I'm working in, and what I need to do overall? I'm not yet experienced in the financial area.

> Set up a blank latest Next.js project with shadcn/ui and Elysia.

## 2. Building the SEC filings API

> Let's add `GET /companies/:ticker/filings` that, for now, outputs what the EDGAR API response gives us. Make sure it supports the structure we agreed on.

> Test it using Elysia's test tooling. For now, test just the `200` response from the API, because we will change the response later and I want to manually check responses.

> For tests, use mocks, not real API calls.

> Let's add to `GET /companies/:ticker/filings` a paginated list that can be filtered by form type, for example `10-K`, `10-Q`, and `8-K`. For pagination, should we use a cursor, not limit/offset

> New backend endpoint: `GET /filings/summary`. Given a set of companies, it returns each company's number of filings per form type over the last 12 months and the date of its latest `10-K`.

> The company query should use the same repeated-parameter contract as form filters.

## 3. Reviewing architecture and complexity

> Don't implement anything yet; just respond. In my task I need only the latest 12 months. Does that cover non-archive filings?

> In that case, let's address the review in code. If we don't need archives for one year, we can clear the related logic.

> This is too many comments. Please keep only the ones that are genuinely needed when something isn't clear

> I think we can also check that the cursor is used for the right ticker. It should be just one line: check whether the combination of date and accession number exists for that ticker.

## 4. Building the UI

> Let's build a UI for these endpoints. Start with filings: a shadcn/ui + TanStack table with pagination and columns for filing identifier, company, and form type. The company field should be a select mapped directly to the filings-per-company API; form type should be a multi-select; and filing date should be sortable.

> Here is useful documentation: https://ui.shadcn.com/docs/components/base/data-table#set-up-table-features

> Can we split the commit into three parts: (1) new UI components and `package.json`, (2) backend update, and (3) UI work? For each part, stage the related files so I can review one step at a time.

> Final task: display the other API in the system, the summary API. It should also be a table, probably with a multi-select for companies to use the API query parameters, plus columns for count, date of latest `10-K`, and perhaps a link to download the `10-K`.

## 5. Performance and caching

> I think we can use something like `cacheLife` of one hour for fillings. What do you think? Don't implement it yet, let's discuss.

> I agree. I also added one more comment to Hunk: we should use Cache Components.

## 6. Review workflow

After each meaningful feature, I used another AI agent to review the changes, both structural and code styles, then i do focused review loop using inline comments and hunk to point out things I don't like in the implemenation:

> Hunk Review: check only my comment, and remove unnecessary comments.

> Hunk Review: I really don't like what you built with `useEffect`s.

> Remove the comments please; you're still adding too much.

