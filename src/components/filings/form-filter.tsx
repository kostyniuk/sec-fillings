"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type FormOption = { form: string; count: number };

export function FormFilter({
  options,
  value,
  onChange,
  disabled,
}: {
  options: FormOption[];
  value: string[];
  onChange: (forms: string[]) => void;
  disabled?: boolean;
}) {
  const toggle = (form: string) =>
    onChange(value.includes(form) ? value.filter((f) => f !== form) : [...value, form]);

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled || options.length === 0}
            className="w-[220px] justify-between font-normal"
          >
            {value.length ? `${value.length} form types` : "All form types"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search form type…" />
            <CommandList>
              <CommandEmpty>No form type found.</CommandEmpty>
              <CommandGroup>
                {options.map((o) => (
                  <CommandItem key={o.form} value={o.form} onSelect={() => toggle(o.form)}>
                    <Check
                      className={cn(value.includes(o.form) ? "opacity-100" : "opacity-0")}
                    />
                    <span className="font-mono text-xs">{o.form}</span>
                    <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                      {o.count}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.slice(0, 3).map((form) => (
        <Badge key={form} variant="secondary" className="font-mono text-xs">
          {form}
          <button
            onClick={() => toggle(form)}
            aria-label={`Remove ${form}`}
            className="hover:text-foreground ml-1 cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      {value.length > 3 && (
        <Badge variant="secondary" className="text-xs">
          +{value.length - 3}
        </Badge>
      )}
      {value.length > 0 && (
        <Button variant="ghost" size="sm" onClick={() => onChange([])}>
          Clear
        </Button>
      )}
    </div>
  );
}
