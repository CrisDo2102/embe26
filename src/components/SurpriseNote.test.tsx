// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { littleNotes } from "@/data/memories";
import SurpriseNote from "./SurpriseNote";

describe("SurpriseNote", () => {
  it("reveals the notes in order, then wraps around", async () => {
    const user = userEvent.setup();
    render(<SurpriseNote />);
    expect(screen.queryByRole("blockquote")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Mở lời nhắn bí mật/ }));
    expect(screen.getByText(`“${littleNotes[0]}”`)).toBeInTheDocument();
    for (let i = 1; i < littleNotes.length; i += 1) {
      await user.click(screen.getByRole("button", { name: /Một lời nhắn nữa nhé/ }));
      expect(screen.getByText(`“${littleNotes[i]}”`)).toBeInTheDocument();
    }
    await user.click(screen.getByRole("button", { name: /Một lời nhắn nữa nhé/ }));
    expect(screen.getByText(`“${littleNotes[0]}”`)).toBeInTheDocument();
  });
  it("announces a new note politely to screen readers", () => {
    const { container } = render(<SurpriseNote />);
    expect(container.querySelector("[aria-live='polite']")).toBeInTheDocument();
  });
});
