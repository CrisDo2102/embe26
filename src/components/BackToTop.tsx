"use client";
import { useEffect, useState } from "react";
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 650);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  if (!visible) return null;
  return <a className="back-to-top-fab" href="#top" aria-label="Trở về đầu trang">↑<span>Về đầu trang</span></a>;
}
