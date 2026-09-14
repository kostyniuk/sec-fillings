"use client";

import { CompanySelect } from "./company-select";
import { FormFilter, type FormOption } from "./form-filter";
import { useFilingsParams } from "./use-filings-params";

export function Filters({ formOptions }: { formOptions: FormOption[] }) {
  const { params, isPending, setFilter } = useFilingsParams();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <CompanySelect
        value={params.ticker}
        disabled={isPending}
        onChange={(ticker) => setFilter({ ticker, forms: [] })}
      />
      <FormFilter
        options={formOptions}
        value={params.forms}
        disabled={isPending}
        onChange={(forms) => setFilter({ forms })}
      />
    </div>
  );
}
