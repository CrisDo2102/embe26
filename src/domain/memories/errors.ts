export type DomainErrorCode = "NOT_FOUND" | "INVALID_INPUT" | "STORAGE_UNAVAILABLE";

/** Raised by domain services; the API layer translates `code` into an HTTP status. */
export class DomainError extends Error {
  constructor(public readonly code: DomainErrorCode, message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export function isDomainError(value: unknown): value is DomainError {
  return value instanceof DomainError;
}
