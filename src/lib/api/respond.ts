import { createHash } from "node:crypto";
import { isDomainError, type DomainErrorCode } from "@/domain/memories/errors";

/** Every error from this API has this exact shape. Never include stack traces or internals. */
export type ApiErrorBody = { error: { code: string; message: string } };

const STATUS_BY_CODE: Record<DomainErrorCode, number> = {
  INVALID_INPUT: 400,
  NOT_FOUND: 404,
  STORAGE_UNAVAILABLE: 503,
};

export function jsonError(code: string, message: string, status: number): Response {
  const body: ApiErrorBody = { error: { code, message } };
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Maps a thrown value to a response. Domain errors carry a safe, user-facing message;
 * anything else is logged (name + message only, never request content) and answered generically.
 */
export function errorResponse(error: unknown, scope: string): Response {
  if (isDomainError(error)) return jsonError(error.code, error.message, STATUS_BY_CODE[error.code]);
  console.error(`[api:${scope}]`, error instanceof Error ? `${error.name}: ${error.message}` : "unknown error");
  return jsonError("INTERNAL", "Máy chủ đang bận. Thử lại sau nhé.", 500);
}

export function weakEtag(json: string): string {
  return `W/"${createHash("sha1").update(json).digest("base64url").slice(0, 27)}"`;
}

/** Implements If-None-Match: a comma separated list of (weak) validators, or `*`. */
export function matchesEtag(header: string | null, etag: string): boolean {
  if (!header) return false;
  const strip = (value: string) => value.trim().replace(/^W\//, "");
  return header.split(",").some((candidate) => candidate.trim() === "*" || strip(candidate) === strip(etag));
}

/** JSON response with a content-derived ETag; answers 304 when the client already has this exact body. */
export function jsonCached(request: Request, body: unknown, cacheControl: string): Response {
  const json = JSON.stringify(body);
  const etag = weakEtag(json);
  const headers = { "Cache-Control": cacheControl, ETag: etag };
  if (matchesEtag(request.headers.get("if-none-match"), etag)) return new Response(null, { status: 304, headers });
  return new Response(json, { status: 200, headers: { ...headers, "Content-Type": "application/json; charset=utf-8" } });
}
