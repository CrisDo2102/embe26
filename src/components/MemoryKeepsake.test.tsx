// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KEEPSAKE_STORAGE_KEY, MAX_KEEPSAKE_LENGTH } from "@/lib/constants";
import { downloadTextFile } from "@/lib/utils/download";

vi.mock("@/lib/utils/download", () => ({ downloadTextFile: vi.fn() }));

/** The keepsake store is a module-level singleton, so each test gets a fresh module graph. */
async function renderKeepsake() {
  vi.resetModules();
  const { default: MemoryKeepsake } = await import("./MemoryKeepsake");
  return render(<MemoryKeepsake />);
}
const stored = () => JSON.parse(window.localStorage.getItem(KEEPSAKE_STORAGE_KEY) ?? "null");
const backupFile = (items: unknown[]) => new File([JSON.stringify({ schemaVersion: 1, exportedAt: "x", items })], "backup.json", { type: "application/json" });

beforeEach(() => vi.mocked(downloadTextFile).mockClear());

describe("resilience (regressions: these used to crash the whole page)", () => {
  it("survives valid JSON of the wrong shape in localStorage", async () => {
    window.localStorage.setItem(KEEPSAKE_STORAGE_KEY, JSON.stringify({ hello: "world" }));
    await renderKeepsake();
    expect(screen.getByText(/Chiếc hộp vẫn đang chờ/)).toBeInTheDocument();
  });
  it("survives array entries of the wrong shape", async () => {
    window.localStorage.setItem(KEY_OR(), JSON.stringify([null, 42, { text: 5 }]));
    await renderKeepsake();
    expect(screen.getByText(/Chiếc hộp vẫn đang chờ/)).toBeInTheDocument();
  });
  it("survives corrupt JSON", async () => {
    window.localStorage.setItem(KEEPSAKE_STORAGE_KEY, "{oops");
    await renderKeepsake();
    expect(screen.getByText(/Chiếc hộp vẫn đang chờ/)).toBeInTheDocument();
  });
  it("keeps working, and says so, when the browser refuses to save", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    const user = userEvent.setup();
    await renderKeepsake();
    await user.type(screen.getByLabelText("Điều muốn lưu giữ"), "vẫn thấy được");
    await user.click(screen.getByRole("button", { name: /Cất vào hộp/ }));
    expect(screen.getByText("vẫn thấy được")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/không cho lưu/);
  });
});
const KEY_OR = () => KEEPSAKE_STORAGE_KEY;

describe("notes", () => {
  it("still shows notes saved by the previous version of the component (legacy { id, text, date })", async () => {
    window.localStorage.setItem(KEEPSAKE_STORAGE_KEY, JSON.stringify([{ id: "a1", text: "ghi chú cũ", date: "2025-12-24T10:00:00.000Z" }]));
    await renderKeepsake();
    expect(screen.getByText("ghi chú cũ")).toBeInTheDocument();
    expect(screen.getByText("01 / 30")).toBeInTheDocument();
  });
  it("adds a note, persists it in the current format, and clears the draft", async () => {
    const user = userEvent.setup();
    await renderKeepsake();
    const submit = screen.getByRole("button", { name: /Cất vào hộp/ });
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText("Điều muốn lưu giữ"), "  một điều nhỏ  ");
    await user.click(submit);
    expect(screen.getByText("một điều nhỏ")).toBeInTheDocument();
    expect(screen.getByLabelText("Điều muốn lưu giữ")).toHaveValue("");
    expect(screen.getByRole("status")).toHaveTextContent("Đã cất vào hộp");
    expect(stored()).toEqual([expect.objectContaining({ text: "một điều nhỏ", mood: "soft", createdAt: expect.any(String) })]);
  });
  it("counts remaining characters from the shared limit", async () => {
    const user = userEvent.setup();
    await renderKeepsake();
    await user.type(screen.getByLabelText("Điều muốn lưu giữ"), "abcde");
    expect(screen.getByText(`${MAX_KEEPSAKE_LENGTH - 5} ký tự còn lại`)).toBeInTheDocument();
  });
  it("fills the draft from a starter suggestion", async () => {
    const user = userEvent.setup();
    await renderKeepsake();
    await user.click(screen.getByRole("button", { name: /Gợi ý một câu/ }));
    expect((screen.getByLabelText("Điều muốn lưu giữ") as HTMLTextAreaElement).value).not.toBe("");
  });
  it("removes a note", async () => {
    window.localStorage.setItem(KEEPSAKE_STORAGE_KEY, JSON.stringify([{ id: "a1", text: "bỏ tôi đi", createdAt: "2026-01-01T00:00:00.000Z" }]));
    const user = userEvent.setup();
    await renderKeepsake();
    await user.click(screen.getByRole("button", { name: /Xóa ghi chú: bỏ tôi đi/ }));
    expect(screen.queryByText("bỏ tôi đi")).not.toBeInTheDocument();
    expect(stored()).toEqual([]);
  });
});

describe("backup and restore", () => {
  it("disables backup while the box is empty", async () => {
    await renderKeepsake();
    expect(screen.getByRole("button", { name: /Sao lưu thành tệp/ })).toBeDisabled();
  });
  it("downloads a dated JSON backup of the current notes", async () => {
    window.localStorage.setItem(KEEPSAKE_STORAGE_KEY, JSON.stringify([{ id: "a1", text: "giữ nhé", createdAt: "2026-01-01T00:00:00.000Z" }]));
    const user = userEvent.setup();
    await renderKeepsake();
    await user.click(screen.getByRole("button", { name: /Sao lưu thành tệp/ }));
    const [filename, content, mime] = vi.mocked(downloadTextFile).mock.calls[0] ?? [];
    expect(filename).toMatch(/^embe-keepsakes-\d{4}-\d{2}-\d{2}\.json$/);
    expect(mime).toContain("application/json");
    expect(JSON.parse(content as string)).toMatchObject({ schemaVersion: 1, items: [{ text: "giữ nhé" }] });
  });
  it("restores notes from a backup file and reports what happened", async () => {
    const user = userEvent.setup();
    await renderKeepsake();
    await user.upload(screen.getByLabelText("Chọn tệp sao lưu hộp kỷ niệm"), backupFile([{ id: "b1", text: "từ thiết bị khác", createdAt: "2026-02-01T00:00:00.000Z" }]));
    expect(await screen.findByText("từ thiết bị khác")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Đã khôi phục 1 ghi chú");
    await user.upload(screen.getByLabelText("Chọn tệp sao lưu hộp kỷ niệm"), backupFile([{ id: "b1", text: "từ thiết bị khác", createdAt: "2026-02-01T00:00:00.000Z" }]));
    expect(await within(screen.getByRole("status")).findByText(/đã có trong hộp rồi/)).toBeInTheDocument();
    expect(screen.getAllByText("từ thiết bị khác")).toHaveLength(1);
  });
  it("explains an unreadable file instead of failing silently", async () => {
    const user = userEvent.setup();
    await renderKeepsake();
    await user.upload(screen.getByLabelText("Chọn tệp sao lưu hộp kỷ niệm"), new File(["not json"], "x.json", { type: "application/json" }));
    expect(await screen.findByText(/không phải JSON hợp lệ/)).toBeInTheDocument();
  });
});
