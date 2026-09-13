const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// SEC caps clients at 10 req/s. Callers queue only long enough to claim a slot,
// then run concurrently. Per-process: on serverless each instance has its own budget.
const MIN_INTERVAL_MS = 110;

let lastStart = 0;
let queue: Promise<void> = Promise.resolve();

async function claimSlot(): Promise<void> {
  const wait = lastStart + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastStart = Date.now();
}

export async function rateLimited<T>(fn: () => Promise<T>): Promise<T> {
  const slot = queue.then(claimSlot);
  queue = slot;
  await slot;

  return fn();
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
    message?: string,
  ) {
    super(message ?? `${status} from ${url}`);
    this.name = "HttpError";
  }
}
