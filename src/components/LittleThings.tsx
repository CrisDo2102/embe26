"use client";
import { useEffect, useState } from "react";

const notes = [
  "Một ngày bình thường cũng trở nên đặc biệt khi có em.",
  "Có những điều bé xíu, nhưng đủ để thương cả một đời.",
  "Nếu được chọn lại, anh vẫn muốn gặp em.",
  "Cảm ơn em vì đã là một phần thật đẹp trong câu chuyện này.",
  "Hạnh phúc đôi khi chỉ là được cùng em ngắm một buổi chiều.",
  "Mọi kỷ niệm đều đáng giữ, nhất là những kỷ niệm có em.",
];
const prompts = [
  "Một khoảnh khắc khiến mình bật cười?",
  "Một nơi tụi mình muốn cùng ghé thăm?",
  "Một bài hát làm mình nhớ đến nhau?",
  "Một điều nhỏ khiến ngày hôm nay đẹp hơn?",
];

export default function LittleThings() {
  const [noteIndex, setNoteIndex] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem("embe:favorite-notes"); if(raw) { const parsed: unknown = JSON.parse(raw); if(Array.isArray(parsed)) setFavorites(parsed.filter((n): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0 && n < notes.length)); } } catch { /* private browsing */ }
  }, []);
  const toggleFavorite = () => {
    const next = favorites.includes(noteIndex) ? favorites.filter(i => i !== noteIndex) : [...favorites, noteIndex];
    setFavorites(next);
    try { localStorage.setItem("embe:favorite-notes", JSON.stringify(next)); } catch { /* storage unavailable */ }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(notes[noteIndex]); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };
  return (
    <section className="little-things section-shell" id="little-things" aria-labelledby="little-things-title">
      <div className="little-things-heading">
        <p className="eyebrow">A LITTLE MORE LOVE <span aria-hidden="true">✳</span></p>
        <h2 id="little-things-title">Small things, <em>big love.</em></h2>
        <p>Những lời nhắn nhỏ dành riêng cho những ngày mình cần một chút dịu dàng.</p>
      </div>
      <div className="little-things-grid">
        <article className="love-note-card" aria-label="Lời nhắn ngẫu nhiên">
          <div className="love-note-top"><span>LOVE NOTE / {String(noteIndex + 1).padStart(2,"0")}</span><span aria-hidden="true">♡</span></div>
          <p className="love-note-quote" aria-live="polite">“{notes[noteIndex]}”</p>
          <div className="love-note-actions">
            <button type="button" className="little-button primary" onClick={() => setNoteIndex(i => (i + 1) % notes.length)}>Lời nhắn tiếp theo <span aria-hidden="true">↗</span></button>
            <button type="button" className="little-icon-button" aria-label={favorites.includes(noteIndex) ? "Bỏ yêu thích" : "Lưu lời nhắn yêu thích"} aria-pressed={favorites.includes(noteIndex)} onClick={toggleFavorite}>{favorites.includes(noteIndex) ? "♥" : "♡"}</button>
            <button type="button" className="little-button secondary" onClick={copy}>{copied ? "Đã sao chép ✓" : "Sao chép"}</button>
          </div>
        </article>
        <article className="conversation-card">
          <div className="conversation-star" aria-hidden="true">✳</div>
          <span className="eyebrow">ONE QUESTION FOR US</span>
          <h3>Mình kể nhau nghe nhé?</h3>
          <p className="conversation-prompt" aria-live="polite">{prompts[promptIndex]}</p>
          <button type="button" className="little-button outlined" onClick={() => setPromptIndex(i => (i + 1) % prompts.length)}>Đổi câu hỏi <span aria-hidden="true">↗</span></button>
        </article>
      </div>
      <div className="favorites-panel">
        <button type="button" className="favorites-toggle" aria-expanded={open} aria-controls="favorite-notes-panel" onClick={() => setOpen(v => !v)}><span>♡ Bộ sưu tập lời nhắn đã lưu</span><span>{favorites.length} lời nhắn {open ? "−" : "+"}</span></button>
        {open && <div id="favorite-notes-panel" className="favorites-content">{favorites.length ? favorites.map(i => <p key={i}>“{notes[i]}”</p>) : <p>Chưa có lời nhắn nào được lưu. Nhấn ♡ để giữ lại điều em thích nhé.</p>}</div>}
      </div>
    </section>
  );
}
