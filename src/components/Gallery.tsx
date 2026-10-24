"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import SafeImage from "@/components/SafeImage";
import { photos } from "@/data/memories";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { useEscapeKey } from "@/hooks/useEscapeKey";

export default function Gallery() {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = active !== null;
  const photo = active === null ? null : (photos[active] ?? null);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback((delta: number) => setActive((current) => (current === null ? current : (current + delta + photos.length) % photos.length)), []);

  useEscapeKey(close, open);
  useDialogFocus(dialogRef, open, ".lightbox-close");
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  return (
    <>
      <div className="gallery-grid">
        {photos.map((item, index) => (
          <motion.button
            key={item.src}
            className={`photo-card photo-card-${index + 1}`}
            onClick={() => setActive(index)}
            whileHover={{ y: -7, rotate: index % 2 ? 1 : -1 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`Mở ảnh: ${item.title}`}
            aria-haspopup="dialog"
          >
            <span className="photo-image-wrap">
              <SafeImage src={item.src} width={item.width} height={item.height} alt={item.alt ?? item.title} sizes="(max-width: 900px) 43vw, 20vw" />
            </span>
            <span className="photo-caption"><strong>{item.title}</strong><small>{item.note}</small></span>
            <span className="photo-index">{String(index + 1).padStart(2, "0")}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {photo && active !== null && (
          <motion.div
            ref={dialogRef}
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh kỷ niệm"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button className="lightbox-close" onClick={close} aria-label="Đóng">×</button>
            <button className="lightbox-arrow left" onClick={(event) => { event.stopPropagation(); step(-1); }} aria-label="Ảnh trước">←</button>
            <motion.figure key={photo.src} initial={{ scale: 0.94, y: 12 }} animate={{ scale: 1, y: 0 }} onClick={(event) => event.stopPropagation()}>
              <SafeImage src={photo.src} width={photo.width} height={photo.height} alt={photo.alt ?? photo.title} sizes="(max-width: 900px) 100vw, 850px" />
              <figcaption>{photo.title} <span>— {photo.note}</span></figcaption>
            </motion.figure>
            <button className="lightbox-arrow right" onClick={(event) => { event.stopPropagation(); step(1); }} aria-label="Ảnh tiếp theo">→</button>
            <p className="visually-hidden" role="status">Ảnh {active + 1} trên {photos.length}: {photo.title}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
