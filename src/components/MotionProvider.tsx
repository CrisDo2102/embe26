"use client";
import { MotionConfig } from "motion/react";
import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { quietModePreference } from "@/lib/storage/quiet-mode";

type QuietContextValue = { quiet: boolean; setQuiet: (value: boolean) => void };
const QuietContext = createContext<QuietContextValue>({ quiet: false, setQuiet: () => undefined });

export function useQuietMode(): QuietContextValue {
  return useContext(QuietContext);
}

/**
 * One switch for all motion. `reducedMotion="user"` honours the OS setting; "quiet mode" forces it.
 * The html class additionally calms CSS animations/transitions (see globals.css).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const quiet = useSyncExternalStore(quietModePreference.subscribe, quietModePreference.getSnapshot, quietModePreference.getServerSnapshot);
  useEffect(() => {
    document.documentElement.classList.toggle("quiet-mode", quiet);
  }, [quiet]);
  const value = useMemo(() => ({ quiet, setQuiet: quietModePreference.set }), [quiet]);
  return (
    <QuietContext value={value}>
      <MotionConfig reducedMotion={quiet ? "always" : "user"}>{children}</MotionConfig>
    </QuietContext>
  );
}
