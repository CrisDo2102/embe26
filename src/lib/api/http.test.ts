import { afterEach, describe, expect, it, vi } from "vitest";
import { getJson, HttpError, isAbortError, userFacingError } from "./http";

afterEach(() => vi.unstubAllGlobals());
const stubFetch = (response: Response | Error) =>
  vi.stubGlobal("fetch", vi.fn(async () => { if (response instanceof Error) throw response; return response; }));

describe("getJson", () => {
  it("returns the parsed body and sends an Accept header", async () => {
    stubFetch(Response.json({ data: [1] }));
    expect(await getJson("/x")).toEqual({ data: [1] });
    expect((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[1]).toMatchObject({ headers: { Accept: "application/json" }, credentials: "same-origin" });
  });
  it("uses the server's own message when the API returns its error shape", async () => {
    stubFetch(Response.json({ error: { code: "NOT_FOUND", message: "Không tìm thấy kỷ niệm này." } }, { status: 404 }));
    await expect(getJson("/x")).rejects.toMatchObject({ name: "HttpError", status: 404, message: "Không tìm thấy kỷ niệm này." });
  });
  it("falls back to a generic message when the error body is not our JSON", async () => {
    stubFetch(new Response("<html>Bad gateway</html>", { status: 502 }));
    await expect(getJson("/x")).rejects.toMatchObject({ status: 502, message: "Yêu cầu không thành công (502)." });
  });
  it("lets network failures through unchanged", async () => {
    stubFetch(new TypeError("Failed to fetch"));
    await expect(getJson("/x")).rejects.toBeInstanceOf(TypeError);
  });
});

describe("error helpers", () => {
  it("recognises aborts", () => {
    expect(isAbortError(new DOMException("x", "AbortError"))).toBe(true);
    expect(isAbortError(new Error("x"))).toBe(false);
    expect(isAbortError("x")).toBe(false);
  });
  it("turns errors into calm, user-facing Vietnamese", () => {
    expect(userFacingError(new DOMException("x", "AbortError"))).toBe("Yêu cầu đã được hủy.");
    expect(userFacingError(new HttpError("boom", 503, "/x"))).toBe("Máy chủ đang bận. Thử lại sau nhé.");
    expect(userFacingError(new HttpError("Mã kỷ niệm không hợp lệ.", 400, "/x"))).toBe("Mã kỷ niệm không hợp lệ.");
    expect(userFacingError(new TypeError("Failed to fetch"))).toContain("Kiểm tra kết nối");
    expect(userFacingError("weird")).toContain("Kiểm tra kết nối");
  });
});
