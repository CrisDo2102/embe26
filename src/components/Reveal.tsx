"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  as?: "div" | "article";
  className?: string;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  amount?: number;
  children: ReactNode;
};

/**
 * Fades content in when it scrolls into view. Motion is the only client code the page's static sections need.
 * Respects reduced-motion / quiet mode via <MotionProvider>. The `reveal` class lets a <noscript> rule keep the
 * content visible when JavaScript is off.
 */
export default function Reveal({ as = "div", className, delay = 0, duration = 0.5, x = 0, y = 18, amount = 0.2, children }: RevealProps) {
  const Component = as === "article" ? motion.article : motion.div;
  return (
    <Component
      className={className ? `reveal ${className}` : "reveal"}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay }}
    >
      {children}
    </Component>
  );
}
