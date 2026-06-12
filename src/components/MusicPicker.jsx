import React, { useState, useRef, useEffect } from "react";
import { Music2, Play, Pause, Check, X } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

// Real streamable audio previews (royalty-free / CC0 sources)
export const MUSIC_TRACKS = [
  { id: "none", n: "No Music", a: "", e: "🔇", url: null },
  { id: "lofi1", n: "Lo-Fi Chill", a: "Pixabay", e: "🎸", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" },
  { id: "hiphop1", n: "Urban Vibe", a: "Pixabay", e: "🎵", url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_946b36efca.mp3" },
  { id: "happy1", n: "Happy Summer", a: "Pixabay", e: "☀️", url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3" },
  { id: "epic1", n: "Epic Moment", a: "Pixabay", e: "💫", url: "https://cdn.pixabay.com/download/audio/2022/08/02/audio_2dde668d05.mp3" },
  { id: "retro1", n: "Retro Groove", a: "Pixabay", e: "💾", url: "https://cdn.pixabay.com/download/audio/2021/11/13/audio_cb4b8c53d7.mp3" },
  { id: "acoustic1", n: "Acoustic Guitar", a: "Pixabay", e: "🎸", url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1b45.mp3" },
  { id: "dance1", n: "Dance Beat", a: "Pixabay", e: "🪩", url: "https://cdn.pixabay.com/download/audio/2022/06/09/audio_b23ba11d2a.mp3" },
];

export default function MusicPicker({ selected, onChange, onClose }) {
  const { accentColor } = useTheme();
  const [playing, setPlaying] = useState(null);
  const audioRef = useRef(null);

  function previewTrack(track) {
    if (!track.url) { stopPreview(); return; }
    if (playing === track.id) { stopPreview(); return; }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    const audio = new Audio(track.url);
    audio.volume = 0.7;
    audio.play().catch(() => {});
    audio.onended = () => setPlaying(null);
    audioRef.current = audio;
    setPlaying(track.id);
  }

  function stopPreview() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    setPlaying(null);
  }

  function selectTrack(track) {
    stopPreview();
    onChange(track.id === "none" ? "" : track.n);
    onClose();
  }

  useEffect(() => () => stopPreview(), []);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => { stopPreview(); onClose(); }}>
      <div className="w-full bg-card rounded-t-3xl pb-6 animate-slide-up max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
        <div className="flex items-center justify-between px-5 py-2 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Music2 size={16} style={{ color: accentColor }} /> Choose Music
          </div>
          <button onClick={() => { stopPreview(); onClose(); }}><X size={18} className="text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {MUSIC_TRACKS.map(track => {
            const isSelected = (track.id === "none" && !selected) || track.n === selected;
            const isPlaying = playing === track.id;
            return (
              <div
                key={track.id}
                className="flex items-center gap-3 px-5 py-3.5 border-b border-border/50 last:border-0 cursor-pointer active:bg-muted/40"
                onClick={() => selectTrack(track)}
              >
                <span className="text-xl flex-shrink-0">{track.e}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{track.n}</div>
                  {track.a && <div className="text-xs text-muted-foreground">{track.a} · Royalty-free</div>}
                </div>
                {track.url && (
                  <button
                    onClick={e => { e.stopPropagation(); previewTrack(track); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: isPlaying ? accentColor : "var(--muted)" }}
                  >
                    {isPlaying
                      ? <Pause size={14} color="#fff" />
                      : <Play size={14} color={isPlaying ? "#fff" : "var(--foreground)"} />
                    }
                  </button>
                )}
                {isSelected && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: accentColor }}>
                    <Check size={11} color="#fff" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}