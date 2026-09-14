"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import {
  parseFilingsParams,
  toSearchParams,
  type FilingsParams,
} from "@/lib/filings-params";

export function useFilingsParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const params = parseFilingsParams(Object.fromEntries(searchParams.entries()));
  params.forms = searchParams.getAll("form");

  const navigate = useCallback(
    (next: FilingsParams, push: boolean) => {
      const search = toSearchParams(next).toString();
      const url = search ? `/?${search}` : "/";

      startTransition(() => {
        if (push) router.push(url, { scroll: false });
        else router.replace(url, { scroll: false });
      });
    },
    [router],
  );

  const setFilter = useCallback(
    (patch: Partial<Omit<FilingsParams, "cursor">>) =>
      navigate({ ...params, ...patch, cursor: undefined }, false),
    [navigate, params],
  );

  const goToCursor = useCallback(
    (cursor: string) => navigate({ ...params, cursor }, true),
    [navigate, params],
  );

  return { params, isPending, setFilter, goToCursor, goBack: router.back };
}
