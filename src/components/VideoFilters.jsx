import React, { useRef, useState } from "react";

export const VIDEO_FILTERS = [
  { id: "none",      label: "Original",   emoji: "✨", style: {} },
  { id: "golden",    label: "Golden Hour", emoji: "🌅", style: { filter: "sepia(0.45) saturate(1.7) brightness(1.1) hue-rotate(-12deg)" } },
  { id: "dreamy",    label: "Dreamy",     emoji: "🌸", style: { filter: "blur(0.4px) brightness(1.15) saturate(1.3) contrast(0.92) hue-rotate(5deg)" } },
  { id: "noir",      label: "Noir",       emoji: "🖤", style: { filter: "grayscale(1) contrast(1.35) brightness(0.82)" } },
  { id: "neon",      label: "Neon Glow",  emoji: "💜", style: { filter: "saturate(2.2) contrast(1.3) brightness(1.05) hue-rotate(15deg)" } },
  { id: "vintage",   label: "Vintage",    emoji: "📼", style: { filter: "sepia(0.65) contrast(1.1) brightness(0.88) saturate(0.75)" } },
  { id: "cinematic", label: "Cinematic",  emoji: "🎬", style: { filter: "contrast(1.2) saturate(0.85) brightness(0.93)" } },
  { id: "cool",      label: "Ice Blue",   emoji: "🧊", style: { filter: "saturate(0.8) hue-rotate(25deg) brightness(1.08) contrast(1.08)" } },
  { id: "warm",      label: "Sunset",     emoji: "🔥", style: { filter: "sepia(0.28) saturate(1.5) brightness(1.07) hue-rotate(-8deg)" } },
  { id: "fade",      label: "Fade",       emoji: "🌫️", style: { filter: "brightness(1.12) contrast(0.82) saturate(0.65)" } },
  { id: "vivid",     label: "Vivid Pop",  emoji: "🌈", style: { filter: "saturate(1.9) contrast(1.18) brightness(1.03)" } },
  { id: "matte",     label: "Matte",      emoji: "🤍", style: { filter: "contrast(0.88) brightness(1.1) saturate(0.72)" } },
];

export function getFilterStyle(filterId) {
  const f = VIDEO_FILTERS.find(f => f.id === filterId);
  return f ? f.style : {};
}

// Swipe-left/right filter picker like Instagram/TikTok
export function FilterPicker({ selected, onChange, previewSrc }) {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(null);

  const selectedIdx = VIDEO_FILTERS.findIndex(f => f.id === selected);

  function handleTouchStart(e) {
    dragStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e) {
    if (dragStartX.current === null) return;
    const diff = dragStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) {
      const dir = diff > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(VIDEO_FILTERS.length - 1, selectedIdx + dir));
      onChange(VIDEO_FILTERS[next].id);
    }
    dragStartX.current = null;
  }

  return (
    <div
      ref={containerRef}
      className="flex items-end gap-4 overflow-x-auto hide-scrollbar px-4 pb-1"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ scrollSnapType: "x mandatory" }}
    >
      {VIDEO_FILTERS.map((f, i) => {
        const isSelected = f.id === selected;
        return (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 transition-all"
            style={{ scrollSnapAlign: "center", opacity: isSelected ? 1 : 0.55, transform: isSelected ? "scale(1.12)" : "scale(1)" }}
          >
            <div
              className="rounded-xl overflow-hidden border-2 transition-all"
              style={{
                width: isSelected ? 64 : 54,
                height: isSelected ? 64 : 54,
                borderColor: isSelected ? "#fff" : "transparent",
                background: "linear-gradient(135deg,#667eea,#764ba2)",
                boxShadow: isSelected ? "0 0 12px rgba(255,255,255,0.4)" : "none",
              }}
            >
              {previewSrc
                ? <img src={previewSrc} alt="" className="w-full h-full object-cover" style={f.style} />
                : <div className="w-full h-full flex items-center justify-center text-2xl" style={f.style}>{f.emoji}</div>
              }
            </div>
            <span className="text-white text-[9px] font-semibold drop-shadow leading-tight text-center max-w-[64px]">{f.label}</span>
          </button>
        );
      })}
    </div>
  );
}