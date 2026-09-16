"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "./data-table-features";
import { useFilingsParams } from "./use-filings-params";

export type FilingRow = {
  accessionNumber: string;
  filingDate: string;
  form: string;
  company: string;
  ticker: string;
  url: string;
};

function FilingDateHeader() {
  const { params, isPending, setFilter } = useFilingsParams();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2"
      disabled={isPending}
      onClick={() => setFilter({ order: params.order === "desc" ? "asc" : "desc" })}
    >
      Filing date
      {params.order === "asc" ? <ArrowUp /> : <ArrowDown />}
    </Button>
  );
}

export const columns: ColumnDef<DataTableFeatures, FilingRow>[] = [
  {
    accessorKey: "accessionNumber",
    header: "Filing identifier",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.accessionNumber}</span>
    ),
  },
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
    accessorKey: "form",
    header: "Form type",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-xs">
        {row.original.form}
      </Badge>
    ),
  },
  {
    accessorKey: "filingDate",
    header: () => <FilingDateHeader />,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.filingDate}</span>
    ),
  },
  {
    accessorKey: "url",
    header: "Document",
    cell: ({ row }) => (
      <Button asChild variant="ghost" size="sm">
        <a href={row.original.url} target="_blank" rel="noreferrer">
          <FileDown />
          {row.original.form}
        </a>
      </Button>
    ),
  },
];
