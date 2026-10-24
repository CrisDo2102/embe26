// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { QUIET_MODE_STORAGE_KEY } from "@/lib/constants";
import { MotionProvider } from "./MotionProvider";
import QuietMode from "./QuietMode";

const mount = () => render(<MotionProvider><QuietMode /></MotionProvider>);

describe("QuietMode", () => {
  it("toggles the calm styling on <html>, exposes state, and persists the choice", async () => {
    const user = userEvent.setup();
    mount();
    const button = screen.getByRole("button", { name: /Chế độ dịu nhẹ/ });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(screen.getByRole("button", { name: /Chế độ bình thường/ })).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveClass("quiet-mode");
    expect(window.localStorage.getItem(QUIET_MODE_STORAGE_KEY)).toBe("1");
    await user.click(screen.getByRole("button", { name: /Chế độ bình thường/ }));
    expect(document.documentElement).not.toHaveClass("quiet-mode");
    expect(window.localStorage.getItem(QUIET_MODE_STORAGE_KEY)).toBeNull();
  });
  it("remembers the choice on the next visit", () => {
    window.localStorage.setItem(QUIET_MODE_STORAGE_KEY, "1");
    mount();
    expect(screen.getByRole("button", { name: /Chế độ bình thường/ })).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement).toHaveClass("quiet-mode");
  });
});
