"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZES } from "@/lib/filings-params";
import { useFilingsParams } from "./use-filings-params";

export function Pagination({ nextCursor }: { nextCursor: string | null }) {
  const { params, isPending, setFilter, goToCursor, goBack } = useFilingsParams();

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span>Rows per page</span>
        <Select
          value={String(params.limit)}
          disabled={isPending}
          onValueChange={(value) => setFilter({ limit: Number(value) })}
        >
          <SelectTrigger size="sm" className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!params.cursor || isPending}
          onClick={goBack}
        >
          <ChevronLeft /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!nextCursor || isPending}
          onClick={() => nextCursor && goToCursor(nextCursor)}
        >
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
