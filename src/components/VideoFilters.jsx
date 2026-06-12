import React from "react";

export const VIDEO_FILTERS = [
  { id: "none", label: "Original", style: {} },
  { id: "vintage", label: "Vintage", style: { filter: "sepia(0.6) contrast(1.1) brightness(0.9) saturate(0.8)" } },
  { id: "retro", label: "Retro", style: { filter: "sepia(0.4) hue-rotate(-20deg) saturate(1.4) contrast(1.2)" } },
  { id: "film", label: "Film", style: { filter: "contrast(1.15) brightness(0.92) saturate(0.85) sepia(0.2)" } },
  { id: "warm", label: "Warm", style: { filter: "sepia(0.3) saturate(1.4) brightness(1.05) hue-rotate(-10deg)" } },
  { id: "cool", label: "Cool", style: { filter: "saturate(0.9) hue-rotate(20deg) brightness(1.05) contrast(1.05)" } },
  { id: "noir", label: "Noir", style: { filter: "grayscale(1) contrast(1.3) brightness(0.85)" } },
  { id: "dreamy", label: "Dreamy", style: { filter: "blur(0.3px) brightness(1.1) saturate(1.2) contrast(0.95)" } },
  { id: "golden", label: "Golden", style: { filter: "sepia(0.5) saturate(1.6) brightness(1.1) hue-rotate(-15deg)" } },
  { id: "fade", label: "Fade", style: { filter: "opacity(0.9) brightness(1.08) saturate(0.7) contrast(0.95)" } },
];

export function getFilterStyle(filterId) {
  const f = VIDEO_FILTERS.find(f => f.id === filterId);
  return f ? f.style : {};
}

export function FilterPicker({ selected, onChange }) {
  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
      {VIDEO_FILTERS.map(f => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0"
        >
          <div
            className="w-14 h-14 rounded-xl overflow-hidden border-2 transition-all"
            style={{
              borderColor: selected === f.id ? "#00c896" : "transparent",
              background: "linear-gradient(135deg,#667eea,#764ba2)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-2xl" style={f.style}>
              🎬
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">{f.label}</span>
        </button>
      ))}
    </div>
  );
}