import React from "react";
import { X } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { THEMES } from "@/lib/constants";

export default function ThemeModal({ onClose }) {
  const { theme, setTheme, accentColor } = useTheme();

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-t-3xl p-5" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-foreground">🎨 Theme & Colors</h3>
          <button onClick={onClose}><X size={20} className="text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); onClose(); }}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all"
              style={{ borderColor: theme === t.id ? t.color : "var(--border)", background: theme === t.id ? `${t.color}15` : "var(--card)" }}
            >
              <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: t.color }} />
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.sub}</div>
              </div>
              {theme === t.id && <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: t.color }}>✓</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}