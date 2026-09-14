"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormCounts } from "./form-counts";
import type { DataTableFeatures } from "@/components/filings/data-table-features";

export type SummaryRow = {
  ticker: string;
  company: string;
  total: number;
  forms: { form: string; count: number }[];
  latest10KDate: string | null;
  latest10KUrl: string | null;
};

export const columns: ColumnDef<DataTableFeatures, SummaryRow>[] = [
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => (
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-xs">{row.original.ticker}</span>
        <span className="text-muted-foreground truncate">{row.original.company}</span>
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: "Filings (12 mo)",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.total.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "forms",
    header: "By form type",
    cell: ({ row }) => <FormCounts forms={row.original.forms} />,
  },
  {
    accessorKey: "latest10KDate",
    header: "Latest 10-K",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.latest10KDate ?? <span className="text-muted-foreground">—</span>}
      </span>
    ),
  },
  {
    accessorKey: "latest10KUrl",
    header: "Document",
    cell: ({ row }) =>
      row.original.latest10KUrl ? (
        <Button asChild variant="ghost" size="sm">
          <a href={row.original.latest10KUrl} target="_blank" rel="noreferrer">
            <FileDown /> 10-K
          </a>
        </Button>
      ) : null,
  },
];
