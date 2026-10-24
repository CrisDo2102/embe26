// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadTextFile } from "./download";

afterEach(() => vi.useRealTimers());

describe("downloadTextFile", () => {
  it("triggers a download of the given content under the given name, then cleans up", async () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    downloadTextFile("note.json", '{"a":1}', "application/json");

    const blob = (createObjectURL.mock.calls[0] as unknown as [Blob])[0];
    expect(blob.type).toBe("application/json");
    expect(await blob.text()).toBe('{"a":1}');
    const clicked = click.mock.contexts[0] as HTMLAnchorElement; // the <a> the browser was asked to click
    expect(clicked.download).toBe("note.json");
    expect(clicked.getAttribute("href")).toBe("blob:mock");
    expect(document.querySelector("a[download]")).toBeNull(); // the temporary link is removed again
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock"); // no leaked object URL
  });
});
