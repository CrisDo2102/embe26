import { afterEach } from "vitest";

// DOM-only setup: component tests opt in with `// @vitest-environment jsdom`.
if (typeof window !== "undefined") {
  await import("@testing-library/jest-dom/vitest");
  const { cleanup } = await import("@testing-library/react");

  // jsdom has no IntersectionObserver, which Motion's `whileInView` requires. Every real browser does.
  if (!("IntersectionObserver" in window)) {
    class StubIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    Object.defineProperty(window, "IntersectionObserver", { configurable: true, value: StubIntersectionObserver });
  }

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    document.body.style.overflow = "";
    document.documentElement.className = "";
  });
}
