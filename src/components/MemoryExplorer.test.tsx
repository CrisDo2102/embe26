// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CategoryCount, MemoryRecord } from "@/domain/memories/types";
import MemoryExplorer from "./MemoryExplorer";

const rec = (n: number, category: MemoryRecord["category"] = "everyday"): MemoryRecord => ({
  id: `memory-${n}`, date: `CHƯƠNG 0${n}`, title: `Kỷ niệm ${n}`, description: `Mô tả ${n}`, category, tags: [],
});
const ALL = [rec(1), rec(2, "dates")];
const BOTH: CategoryCount[] = [{ category: "dates", count: 1 }, { category: "everyday", count: 1 }];
const ok = (data: MemoryRecord[]) => Response.json({ data, meta: { count: data.length, query: "", category: "all" } });

const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
const urls = () => fetchMock.mock.calls.map(([input]) => String(input));
const titles = () => screen.queryAllByRole("button", { expanded: false }).map((b) => b.querySelector("strong")?.textContent);

describe("MemoryExplorer", () => {
  it("shows the server-rendered list immediately without any request", () => {
    render(<MemoryExplorer initialItems={ALL} categories={BOTH} />);
    expect(screen.getByText("Kỷ niệm 1")).toBeInTheDocument();
    expect(screen.getByText("02 mẩu chuyện")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("debounces typing into a single request and renders its results", async () => {
    fetchMock.mockResolvedValue(ok([rec(2, "dates")]));
    const user = userEvent.setup();
    render(<MemoryExplorer initialItems={ALL} categories={BOTH} />);
    await user.type(screen.getByRole("searchbox"), "hen");
    await waitFor(() => expect(titles()).toEqual(["Kỷ niệm 2"]));
    expect(urls()).toEqual(["/api/memories?q=hen"]);
  });

  it("keeps the previous results on screen (marked busy) while a new search is in flight", async () => {
    let resolve!: (r: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((r) => (resolve = r)));
    const user = userEvent.setup();
    render(<MemoryExplorer initialItems={ALL} categories={BOTH} />);
    await user.type(screen.getByRole("searchbox"), "x");
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.getByText("Kỷ niệm 1")).toBeInTheDocument();
    expect(document.querySelector(".explorer-results")).toHaveAttribute("aria-busy", "true");
    resolve(ok([rec(1)]));
    await waitFor(() => expect(document.querySelector(".explorer-results")).toHaveAttribute("aria-busy", "false"));
  });

  it("aborts a superseded request", async () => {
    fetchMock.mockImplementation(() => new Promise<Response>(() => undefined));
    const user = userEvent.setup({ delay: 260 }); // slower than the debounce, so each keystroke is its own request
    render(<MemoryExplorer initialItems={ALL} categories={BOTH} />);
    await user.type(screen.getByRole("searchbox"), "ab");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    expect(fetchMock.mock.calls[1]?.[1]?.signal?.aborted).toBe(false);
  });

  it("restores the original list from cache when the search is cleared", async () => {
    fetchMock.mockResolvedValue(ok([rec(2, "dates")]));
    const user = userEvent.setup();
    render(<MemoryExplorer initialItems={ALL} categories={BOTH} />);
    await user.type(screen.getByRole("searchbox"), "hen");
    await waitFor(() => expect(titles()).toEqual(["Kỷ niệm 2"]));
    await user.clear(screen.getByRole("searchbox"));
    await waitFor(() => expect(titles()).toEqual(["Kỷ niệm 1", "Kỷ niệm 2"]));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("says so when nothing matches", async () => {
    fetchMock.mockResolvedValue(ok([]));
    const user = userEvent.setup();
    render(<MemoryExplorer initialItems={ALL} categories={BOTH} />);
    await user.type(screen.getByRole("searchbox"), "zzz");
    expect(await screen.findByText("Chưa tìm thấy mẩu chuyện này.")).toBeInTheDocument();
  });

  it("shows a friendly error and recovers on retry", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ error: { code: "INTERNAL", message: "x" } }, { status: 500 }));
    const user = userEvent.setup();
    render(<MemoryExplorer initialItems={ALL} categories={BOTH} />);
    await user.type(screen.getByRole("searchbox"), "hen");
    expect(await screen.findByRole("alert")).toHaveTextContent("Máy chủ đang bận");
    fetchMock.mockResolvedValueOnce(ok([rec(2, "dates")]));
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    await waitFor(() => expect(titles()).toEqual(["Kỷ niệm 2"]));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("handles a network failure", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const user = userEvent.setup();
    render(<MemoryExplorer initialItems={ALL} categories={BOTH} />);
    await user.type(screen.getByRole("searchbox"), "hen");
    expect(await screen.findByRole("alert")).toHaveTextContent("Kiểm tra kết nối");
  });

  it("offers the category filter only when there is something to choose between", async () => {
    const { unmount } = render(<MemoryExplorer initialItems={ALL} categories={[{ category: "everyday", count: 2 }]} />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    unmount();

    fetchMock.mockResolvedValue(ok([rec(2, "dates")]));
    const user = userEvent.setup();
    render(<MemoryExplorer initialItems={ALL} categories={BOTH} />);
    await user.selectOptions(screen.getByRole("combobox"), "dates");
    await waitFor(() => expect(urls()).toEqual(["/api/memories?category=dates"]));
  });

  it("expands and collapses a memory, exposing the state to assistive tech", async () => {
    const user = userEvent.setup();
    render(<MemoryExplorer initialItems={ALL} categories={BOTH} />);
    const first = screen.getByRole("button", { name: /Kỷ niệm 1/ });
    expect(first).toHaveAttribute("aria-expanded", "false");
    await user.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Mô tả 1")).toBeInTheDocument();
    await user.click(first);
    expect(screen.queryByText("Mô tả 1")).not.toBeInTheDocument();
  });
});
