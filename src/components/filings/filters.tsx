"use client";

import { CompanySelect } from "./company-select";
import { MultiSelect } from "./multi-select";
import { useFilingsParams } from "./use-filings-params";

export type FormOption = { form: string; count: number };

export function Filters({ formOptions }: { formOptions: FormOption[] }) {
  const { params, isPending, setFilter } = useFilingsParams();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <CompanySelect
        value={params.ticker}
        disabled={isPending}
        onChange={(ticker) => setFilter({ ticker, forms: [] })}
      />
      <MultiSelect
        options={formOptions.map((o) => ({ value: o.form, hint: String(o.count) }))}
        value={params.forms}
        disabled={isPending}
        onChange={(forms) => setFilter({ forms })}
        placeholder="All form types"
        selectedLabel={(n) => `${n} form types`}
        searchLabel="Search form type…"
        emptyLabel="No form type found."
      />
    </div>
  );
}
