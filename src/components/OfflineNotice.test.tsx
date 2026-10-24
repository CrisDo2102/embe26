// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OfflineNotice from "./OfflineNotice";

const setOnline = (value: boolean) => {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(value);
  act(() => window.dispatchEvent(new Event(value ? "online" : "offline")));
};

describe("OfflineNotice", () => {
  it("appears when the connection drops and disappears when it returns", () => {
    render(<OfflineNotice />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    setOnline(false);
    expect(screen.getByRole("status")).toHaveTextContent("ngoại tuyến");
    setOnline(true);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
