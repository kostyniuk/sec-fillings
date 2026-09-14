import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">No such company</h1>
      <p className="text-muted-foreground text-sm">
        That ticker has no registrant in the SEC&rsquo;s ticker index.
      </p>
      <Button asChild>
        <Link href="/">Back to filings</Link>
      </Button>
    </main>
  );
}
