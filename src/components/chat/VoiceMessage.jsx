import React, { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";

export default function VoiceMessage({ audioUrl, isMe, accentColor }) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onMeta = () => setDuration(audio.duration || 0);
    const onTime = () => setProgress(audio.currentTime / (audio.duration || 1));
    const onEnd = () => { setPlaying(false); setProgress(0); };
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  }

  const fmtTime = (s) => {
    const sec = Math.floor(s || 0);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  };

  // Generate waveform bars
  const bars = Array.from({ length: 28 }, (_, i) => i);
  const playedBars = Math.floor(progress * bars.length);

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl max-w-[240px]"
      style={{
        background: isMe ? accentColor : "var(--muted)",
        borderBottomRightRadius: isMe ? 4 : undefined,
        borderBottomLeftRadius: !isMe ? 4 : undefined,
      }}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: isMe ? "rgba(255,255,255,0.2)" : "var(--card)" }}
      >
        {playing ? <Pause size={16} color={isMe ? "#fff" : "var(--foreground)"} /> : <Play size={16} color={isMe ? "#fff" : "var(--foreground)"} fill={isMe ? "#fff" : "var(--foreground)"} />}
      </button>
      <div className="flex items-center gap-0.5 flex-1 h-8">
        {bars.map((i) => (
          <div
            key={i}
            className="flex-1 rounded-full transition-all"
            style={{
              height: `${20 + Math.sin(i * 1.7) * 50 + 30}%`,
              background: i < playedBars
                ? (isMe ? "rgba(255,255,255,0.9)" : accentColor)
                : (isMe ? "rgba(255,255,255,0.25)" : "var(--muted-foreground)"),
              opacity: i < playedBars ? 1 : 0.5,
              animation: playing && i >= playedBars && i < playedBars + 3 ? "voiceBar 0.4s ease-in-out infinite" : "none",
              animationDelay: `${i * 0.03}s`,
            }}
          />
        ))}
      </div>
      <span className="text-[10px] font-medium flex-shrink-0" style={{ color: isMe ? "rgba(255,255,255,0.8)" : "var(--muted-foreground)" }}>
        {fmtTime(duration)}
      </span>
    </div>
  );
}