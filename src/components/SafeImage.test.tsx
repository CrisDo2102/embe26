// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import SafeImage from "./SafeImage";

afterEach(() => {
  // @ts-expect-error restore jsdom defaults after the pre-hydration test overrides them
  delete HTMLImageElement.prototype.complete;
  // @ts-expect-error see above
  delete HTMLImageElement.prototype.naturalWidth;
});

describe("SafeImage", () => {
  it("renders an optimized image with its alt text", () => {
    render(<SafeImage src="/assets/images/photo-1.jpg" width={100} height={200} alt="một bức ảnh" />);
    expect(screen.getByAltText("một bức ảnh")).toBeInTheDocument();
  });
  it("swaps in a labelled placeholder when the file fails to load", () => {
    render(<SafeImage src="/missing.jpg" width={100} height={100} alt="ảnh bị thiếu" />);
    fireEvent.error(screen.getByAltText("ảnh bị thiếu"));
    expect(screen.getByRole("img", { name: "ảnh bị thiếu" })).toHaveClass("image-fallback");
  });
  it("also catches an image that already failed before React hydrated", () => {
    Object.defineProperty(HTMLImageElement.prototype, "complete", { configurable: true, get: () => true });
    Object.defineProperty(HTMLImageElement.prototype, "naturalWidth", { configurable: true, get: () => 0 });
    render(<SafeImage src="/missing.jpg" width={100} height={100} alt="đã hỏng từ trước" />);
    expect(screen.getByRole("img", { name: "đã hỏng từ trước" })).toHaveClass("image-fallback");
  });
});
