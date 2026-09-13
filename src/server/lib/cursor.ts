export class InvalidCursorError extends Error {
  constructor(cursor: string) {
    super(`Cursor does not belong to this query: ${JSON.stringify(cursor)}`);
    this.name = "InvalidCursorError";
  }
}

export const encodeCursor = (accessionNumber: string): string =>
  Buffer.from(accessionNumber).toString("base64url");

export const decodeCursor = (raw: string): string =>
  Buffer.from(raw, "base64url").toString();
