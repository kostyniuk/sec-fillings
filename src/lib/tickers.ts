export type TickerOption = { ticker: string; name: string };

// Example companies, will wire up search later
export const TICKERS: TickerOption[] = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "MSFT", name: "Microsoft Corp." },
  { ticker: "NVDA", name: "NVIDIA Corp." },
  { ticker: "AMZN", name: "Amazon.com Inc." },
  { ticker: "GOOGL", name: "Alphabet Inc." },
  { ticker: "META", name: "Meta Platforms Inc." },
  { ticker: "TSLA", name: "Tesla Inc." },
  { ticker: "JPM", name: "JPMorgan Chase & Co." },
  { ticker: "BAC", name: "Bank of America Corp." },
  { ticker: "WFC", name: "Wells Fargo & Co." },
  { ticker: "KO", name: "Coca-Cola Co." },
  { ticker: "NKE", name: "Nike Inc." },
];
