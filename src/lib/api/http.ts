export class HttpError extends Error {
  constructor(message: string, public readonly status: number, public readonly endpoint: string) {
    super(message);
    this.name = "HttpError";
  }
}

/** Reads the `{ error: { message } }` body our API returns, if there is one. */
async function readApiMessage(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json();
    const message = (body as { error?: { message?: unknown } } | null)?.error?.message;
    return typeof message === "string" ? message : undefined;
  } catch {
    return undefined;
  }
}

export async function getJson<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(endpoint, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
    credentials: "same-origin",
  });
  if (!response.ok) {
    const message = (await readApiMessage(response)) ?? `Yêu cầu không thành công (${response.status}).`;
    throw new HttpError(message, response.status, endpoint);
  }
  return (await response.json()) as T;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function userFacingError(error: unknown): string {
  if (isAbortError(error)) return "Yêu cầu đã được hủy.";
  if (error instanceof HttpError) {
    if (error.status >= 500) return "Máy chủ đang bận. Thử lại sau nhé.";
    return error.message;
  }
  return "Có lỗi nhỏ xảy ra. Kiểm tra kết nối rồi thử lại nhé.";
}
