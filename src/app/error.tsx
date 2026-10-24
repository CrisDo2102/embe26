"use client";
import { useEffect } from "react";
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { if (process.env.NODE_ENV === "development") console.error(error); }, [error]);
  return <main className="route-state" role="alert">
    <span className="route-state-flower" aria-hidden="true">♡</span>
    <p className="eyebrow">A SMALL DETOUR</p>
    <h1>Có điều gì đó chưa ổn.</h1>
    <p>Những kỷ niệm vẫn ở đây. Mình thử mở lại trang nhé.</p>
    <button className="button button-dark" onClick={reset}>Thử lại <span>↻</span></button>
  </main>;
}
