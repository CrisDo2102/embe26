"use client";
import { useState } from "react";

export default function DiningImage({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || src === failedSrc) {
    return <div className={`dining-photo-fallback ${className}`} role="img" aria-label={`Chưa có ảnh: ${alt}`}><span aria-hidden="true">✳</span><small>OUR LITTLE FOOD DIARY</small></div>;
  }
  // Plain <img> avoids exposing arbitrary external URLs (imagePath only allows local filenames).
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailedSrc(src)} />;
}
