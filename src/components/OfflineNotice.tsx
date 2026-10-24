"use client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
export default function OfflineNotice() {
  const online = useOnlineStatus();
  if (online) return null;
  return <div className="offline-notice" role="status"><span aria-hidden="true">♡</span> Bạn đang ngoại tuyến. Những điều đã lưu trên trình duyệt vẫn ở đây.</div>;
}
