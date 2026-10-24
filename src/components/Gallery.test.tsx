// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { photos } from "@/data/memories";
import Gallery from "./Gallery";

const thumb = (index: number) => screen.getByRole("button", { name: `Mở ảnh: ${photos[index]?.title}` });

describe("Gallery lightbox", () => {
  it("renders every photo with intrinsic dimensions (no layout shift)", () => {
    render(<Gallery />);
    for (const photo of photos) {
      const img = screen.getByAltText(photo.alt ?? photo.title);
      expect(img).toHaveAttribute("width", String(photo.width));
      expect(img).toHaveAttribute("height", String(photo.height));
    }
  });

  it("opens as a modal dialog, moves focus inside, and locks page scroll", async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    await user.click(thumb(0));
    const dialog = screen.getByRole("dialog", { name: "Xem ảnh kỷ niệm" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("button", { name: "Đóng" })).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("keeps Tab and Shift+Tab inside the dialog", async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    await user.click(thumb(0));
    const close = screen.getByRole("button", { name: "Đóng" });
    const next = screen.getByRole("button", { name: "Ảnh tiếp theo" });
    await user.tab();
    await user.tab();
    expect(next).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus(); // wrapped around instead of escaping to the page behind
    await user.tab({ shift: true });
    expect(next).toHaveFocus();
  });

  it("closes with Escape, unlocks scroll and returns focus to the photo that opened it", async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    await user.click(thumb(1));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe("");
    expect(thumb(1)).toHaveFocus();
  });

  it("navigates with the arrow keys and wraps around", async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    await user.click(thumb(0));
    const caption = () => screen.getByRole("dialog").querySelector("figcaption")?.textContent ?? "";
    await user.keyboard("{ArrowLeft}");
    await waitFor(() => expect(caption()).toContain(photos[photos.length - 1]?.title));
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(caption()).toContain(photos[0]?.title));
  });

  it("closes when the backdrop is clicked but not when the photo is", async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    await user.click(thumb(0));
    await user.click(screen.getByRole("dialog").querySelector("figure") as HTMLElement);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("dialog"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("announces the position to screen readers", async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    await user.click(thumb(2));
    expect(screen.getByRole("status")).toHaveTextContent(`Ảnh 3 trên ${photos.length}`);
  });
});
