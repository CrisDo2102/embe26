"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * next/image with a graceful failure mode: if the file is missing or broken, show a quiet placeholder
 * that keeps the same box, instead of a broken-image icon and a collapsed layout.
 */
export default function SafeImage({ alt, ...props }: ImageProps & { alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="image-fallback" role="img" aria-label={alt}>♡</span>;
  return (
    <Image
      {...props}
      alt={alt}
      // The image may have failed before React hydrated and attached onError, so also check on mount.
      ref={(img) => {
        if (img?.complete && img.naturalWidth === 0) setFailed(true);
      }}
      onError={() => setFailed(true)}
    />
  );
}
