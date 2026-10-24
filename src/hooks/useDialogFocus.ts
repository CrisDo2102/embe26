"use client";
import { useEffect, type RefObject } from "react";

const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Makes a custom modal behave like a real one while `open`:
 * moves focus inside, keeps Tab/Shift+Tab inside, locks page scroll, and restores focus on close.
 */
export function useDialogFocus(containerRef: RefObject<HTMLElement | null>, open: boolean, initialFocus?: string): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!open || !container) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const initial = initialFocus ? container.querySelector<HTMLElement>(initialFocus) : null;
    (initial ?? container.querySelector<HTMLElement>(FOCUSABLE) ?? container).focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !container) return;
      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      const outside = !container.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [containerRef, open, initialFocus]);
}
