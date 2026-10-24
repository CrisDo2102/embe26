// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** START_DATE is read from the environment when the module loads, so each case imports it fresh. */
async function load(startDate: string | undefined) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_RELATIONSHIP_START_DATE", startDate ?? "");
  return (await import("./AnniversaryCounter")).default;
}
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-14T05:00:00Z"));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("AnniversaryCounter", () => {
  it("shows the number of days since the configured date", async () => {
    const Counter = await load("2026-10-01");
    render(<Counter />);
    expect(screen.getByText("13 ngày")).toBeInTheDocument();
    expect(screen.getByText("bên nhau, trong câu chuyện này")).toBeInTheDocument();
  });
  it("formats large numbers the Vietnamese way", async () => {
    const Counter = await load("2020-01-01");
    render(<Counter />);
    expect(screen.getByText(/^2\.\d{3} ngày$/)).toBeInTheDocument();
  });
  it.each([
    ["unset", undefined],
    ["an impossible date", "2026-02-31"],
    ["a future date", "2030-01-01"],
    ["a malformed value", "yesterday"],
  ])("falls back to the neutral message for %s", async (_label, value) => {
    const Counter = await load(value);
    render(<Counter />);
    expect(screen.getByText("Mỗi ngày")).toBeInTheDocument();
  });
  it("renders the neutral message on the server, so hydration always matches", async () => {
    const Counter = await load("2026-10-01");
    const html = renderToString(<Counter />);
    expect(html).toContain("Mỗi ngày");
    expect(html).not.toContain("13 ngày");
  });
});
