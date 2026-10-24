// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cover, memories, photos } from "@/data/memories";
import HomePage from "./page";

async function renderPage() {
  return render(await HomePage());
}

describe("home page", () => {
  it("has the landmarks and heading structure assistive tech expects", async () => {
    await renderPage();
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("main")).not.toContainElement(screen.getByRole("navigation"));
  });

  it("has no dead in-page links (every #anchor points at a real element)", async () => {
    const { container } = await renderPage();
    const hrefs = Array.from(container.querySelectorAll<HTMLAnchorElement>("a[href^='#']")).map((a) => a.getAttribute("href") as string);
    expect(hrefs.length).toBeGreaterThan(5);
    for (const href of new Set(hrefs)) expect(container.querySelector(href), `missing target for ${href}`).not.toBeNull();
  });

  it("offers a skip link that jumps to the main content", async () => {
    await renderPage();
    expect(screen.getByRole("link", { name: "Bỏ qua điều hướng" })).toHaveAttribute("href", "#main");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
  });

  it("renders the static content on the server: timeline, hero image and the full memory list", async () => {
    const { container } = await renderPage();
    expect(container.querySelectorAll(".timeline-item")).toHaveLength(memories.length);
    const hero = screen.getByAltText(cover.alt);
    expect(hero).toHaveAttribute("fetchpriority", "high"); // the LCP image is fetched ahead of everything else
    expect(container.querySelectorAll(".explorer-item")).toHaveLength(memories.length);
    expect(container.querySelectorAll(".photo-card")).toHaveLength(photos.length);
  });

  it("only offers category filters that contain memories", async () => {
    await renderPage();
    const select = screen.getByRole("combobox");
    const labels = within(select).getAllByRole("option").map((o) => o.textContent);
    expect(labels).toEqual(["Tất cả", "Những buổi hẹn", "Ngày thường"]); // no empty "Những chuyến đi"
  });

  it("keeps the quote's apostrophe exactly as written", async () => {
    await renderPage();
    expect(screen.getByText("“In a room full of art, I'd still stare at you.”")).toBeInTheDocument();
  });
});
