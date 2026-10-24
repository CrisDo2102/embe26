"use client";
import { useSyncExternalStore } from "react";
import { daysSinceYmd } from "@/lib/utils/date";

/** Set NEXT_PUBLIC_RELATIONSHIP_START_DATE (YYYY-MM-DD) once the real date is known. Invalid or future dates hide the number. */
const START_DATE = process.env.NEXT_PUBLIC_RELATIONSHIP_START_DATE;

const subscribe = () => () => undefined; // the value only depends on the clock; nothing to subscribe to

export default function AnniversaryCounter() {
  // Server and first client render both see `null`, so hydration matches; the real number appears right after.
  const days = useSyncExternalStore(subscribe, () => daysSinceYmd(START_DATE), () => null);
  return (
    <div className="anniversary-counter">
      <span className="counter-flower">✳</span>
      <div>
        <small>EVERY DAY IS A LITTLE CHAPTER</small>
        <strong>{days === null ? "Mỗi ngày" : `${days.toLocaleString("vi-VN")} ngày`}</strong>
        <span>{days === null ? "một trang nhỏ trong câu chuyện này" : "bên nhau, trong câu chuyện này"}</span>
      </div>
      <span className="counter-heart">♡</span>
    </div>
  );
}
