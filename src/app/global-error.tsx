"use client";

/** Last-resort boundary: replaces the root layout, so it brings its own <html> and inline styles. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, background: "#f7f1e8", color: "#28271f", fontFamily: "Georgia, serif" }}>
        <main role="alert" style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
          <div>
            <p style={{ fontSize: 32, color: "#a64e3c", margin: 0 }} aria-hidden="true">♡</p>
            <h1 style={{ fontWeight: 500 }}>Có điều gì đó chưa ổn.</h1>
            <p>Những kỷ niệm vẫn ở đây. Mình thử mở lại trang nhé.</p>
            <button onClick={reset} style={{ padding: "12px 20px", border: 0, background: "#28271f", color: "#fffaf2", cursor: "pointer" }}>Thử lại ↻</button>
          </div>
        </main>
      </body>
    </html>
  );
}
