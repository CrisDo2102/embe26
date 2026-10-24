"use client";
import { useQuietMode } from "@/components/MotionProvider";

export default function QuietMode() {
  const { quiet, setQuiet } = useQuietMode();
  return (
    <button className="quiet-toggle" type="button" onClick={() => setQuiet(!quiet)} aria-pressed={quiet} title="Giảm chuyển động và hiệu ứng">
      {quiet ? "☼ Chế độ bình thường" : "☾ Chế độ dịu nhẹ"}
    </button>
  );
}
