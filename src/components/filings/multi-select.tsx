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

export type MultiSelectOption = { value: string; hint?: string };

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  selectedLabel,
  searchLabel,
  emptyLabel,
  max,
  disabled,
}: {
  options: MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  selectedLabel: (count: number) => string;
  searchLabel: string;
  emptyLabel: string;
  max?: number;
  disabled?: boolean;
}) {
  const toggle = (option: string) => {
    if (value.includes(option)) return onChange(value.filter((v) => v !== option));
    if (max && value.length >= max) return;
    onChange([...value, option]);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled || options.length === 0}
            className="w-[220px] justify-between font-normal"
          >
            {value.length ? selectedLabel(value.length) : placeholder}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchLabel} />
            <CommandList>
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={
                      !!max && value.length >= max && !value.includes(option.value)
                    }
                    onSelect={() => toggle(option.value)}
                  >
                    <Check
                      aria-hidden
                      className={cn(
                        value.includes(option.value) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="font-mono text-xs">{option.value}</span>
                    <span className="sr-only">
                      {value.includes(option.value) ? "selected" : "not selected"}
                    </span>
                    {option.hint && (
                      <span className="text-muted-foreground ml-auto truncate text-xs tabular-nums">
                        {option.hint}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.slice(0, 3).map((option) => (
        <Badge key={option} variant="secondary" className="font-mono text-xs">
          {option}
          <button
            onClick={() => toggle(option)}
            aria-label={`Remove ${option}`}
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
