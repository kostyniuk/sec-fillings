"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TICKERS } from "@/lib/tickers";

export function CompanySelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (ticker: string) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[260px]">
        <SelectValue placeholder="Select a company" />
      </SelectTrigger>
      <SelectContent>
        {TICKERS.map((t) => (
          <SelectItem key={t.ticker} value={t.ticker}>
            <span className="font-mono text-xs">{t.ticker}</span>
            <span className="text-muted-foreground ml-2">{t.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
