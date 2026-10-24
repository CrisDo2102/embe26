"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { littleNotes } from "@/data/memories";

export default function SurpriseNote() {
  const [noteIndex, setNoteIndex] = useState(-1);
  const note = littleNotes[noteIndex];
  return (
    <div className="surprise-card">
      <div className="surprise-flower">✳</div>
      <p className="eyebrow">A TINY SURPRISE</p>
      <h3>Mở một lời nhắn dành riêng cho em</h3>
      <p className="surprise-description">Lúc nào cần một chút dịu dàng, quay lại đây nhé.</p>
      <button className="button button-dark" onClick={() => setNoteIndex((noteIndex + 1) % littleNotes.length)}>
        {note ? "Một lời nhắn nữa nhé ↗" : "Mở lời nhắn bí mật ↗"}
      </button>
      <div aria-live="polite">
        {note && (
          <motion.blockquote key={noteIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            “{note}”
          </motion.blockquote>
        )}
      </div>
    </div>
  );
}
