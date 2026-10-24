"use client";
import { useRef, useState } from "react";

const TRACK = "/assets/music/birthday-song.mp3";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
      setMessage("");
    } catch (error) {
      const unsupported = error instanceof DOMException && error.name === "NotSupportedError";
      setMessage(unsupported ? "Bản nhạc chưa sẵn sàng lúc này — thử lại sau nhé." : "Trình duyệt chưa cho phát nhạc — thử bấm lại nhé.");
    }
  }

  return (
    <div className="music-widget">
      {/* preload="none": the track is several MB, so it is only fetched when someone actually presses play. */}
      <audio
        ref={audioRef}
        src={TRACK}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setMessage("Bản nhạc chưa sẵn sàng lúc này — thử lại sau nhé.");
        }}
      />
      <span className={`music-dot ${playing ? "is-playing" : ""}`} aria-hidden="true">♫</span>
      <div className="music-copy">
        <strong>Our little soundtrack</strong>
        <small>{playing ? "Đang phát bản nhạc của tụi mình" : "Một bản nhạc cho lúc đọc thư"}</small>
      </div>
      <button className="music-button" onClick={toggle} aria-pressed={playing} aria-label={playing ? "Tạm dừng nhạc" : "Phát nhạc"}>
        {playing ? "Ⅱ" : "▶"}
      </button>
      <span className="music-error" role="status">{message}</span>
    </div>
  );
}
