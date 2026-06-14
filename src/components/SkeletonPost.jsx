import React from "react";

export default function SkeletonPost() {
  return (
    <div className="relative w-full flex-shrink-0 bg-zinc-900 overflow-hidden" style={{ height: "100svh" }}>
      {/* Shimmer overlay */}
      <div className="absolute inset-0" style={{ animation: "shimmer 1.6s ease-in-out infinite" }} />

      {/* Right action bar skeleton */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-8 h-8 rounded-full bg-white/10" />
        ))}
        <div className="w-12 h-12 rounded-full bg-white/10" />
      </div>

      {/* Bottom info skeleton */}
      <div className="absolute bottom-8 left-4 right-20 flex flex-col gap-2">
        <div className="w-24 h-3 rounded-full bg-white/20" />
        <div className="w-40 h-3 rounded-full bg-white/15" />
        <div className="w-32 h-3 rounded-full bg-white/10" />
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%) no-repeat -200% 0; }
          100% { background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%) no-repeat 200% 0; }
        }
      `}</style>
    </div>
  );
}