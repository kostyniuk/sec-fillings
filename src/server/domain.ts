export type Filing = {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  acceptanceDateTime: string;
  act: string;
  form: string;
  fileNumber: string;
  filmNumber: string;
  items: string;
  coreType: string;
  size: number;
  isXBRL: boolean;
  isInlineXBRL: boolean;
  isXBRLNumeric: boolean | null;
  primaryDocument: string;
  primaryDocDescription: string;
};

export type Company = {
  cik: string;
  name: string;
  tickers: string[];
  exchanges: string[];
  sic: string;
  sicDescription: string;
  entityType: string;
};

export type CompanyFilings = {
  company: Company;
  since: string;
  // Newest first.
  filings: Filing[];
  page: {
    limit: number;
    nextCursor: string | null;
  };
};
