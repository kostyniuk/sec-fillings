"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/eden";

export default function Home() {
  const [result, setResult] = useState<string>();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Next.js + shadcn/ui + Elysia</h1>
      <Button
        onClick={async () => {
          const { data } = await api.health.get();
          setResult(JSON.stringify(data));
        }}
      >
        Ping /api/health
      </Button>
      {result && (
        <pre className="text-muted-foreground text-sm">{result}</pre>
      )}
    </main>
  );
}
