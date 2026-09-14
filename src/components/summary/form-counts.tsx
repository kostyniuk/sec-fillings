"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const COLLAPSED = 5;

export function FormCounts({ forms }: { forms: { form: string; count: number }[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? forms : forms.slice(0, COLLAPSED);
  const hidden = forms.length - shown.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map(({ form, count }) => (
        <Badge key={form} variant="outline" className="font-mono text-xs">
          {form}
          <span className="text-muted-foreground ml-1 tabular-nums">{count}</span>
        </Badge>
      ))}
      {(hidden > 0 || expanded) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : `+${hidden} more`}
        </Button>
      )}
    </div>
  );
}
