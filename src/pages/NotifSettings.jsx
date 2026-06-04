import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

const NOTIF_ITEMS = [
  { icon: "❤️", bg: "#ffd6d6", label: "Likes" },
  { icon: "🔁", bg: "#d4f5e9", label: "Reloops" },
  { icon: "💬", bg: "#dbeeff", label: "Comments" },
  { icon: "💰", bg: "#fff3cd", label: "Tips" },
  { icon: "🎤", bg: "#fff3cd", label: "Voice Messages" },
  { icon: "🌙", bg: "#e8e8e8", label: "Do Not Disturb", defaultOff: true },
];

export default function NotifSettings() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [toggles, setToggles] = useState(() => Object.fromEntries(NOTIF_ITEMS.map(i => [i.label, !i.defaultOff])));

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: accentColor }}>
        <button onClick={() => navigate(-1)}><ChevronLeft size={22} color="#fff" /></button>
        <span className="text-base font-bold text-white">Notifications</span>
        <div style={{ width: 22 }} />
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-6 px-4 pt-4">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {NOTIF_ITEMS.map(item => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: item.bg }}>{item.icon}</div>
              <div className="flex-1 text-sm font-semibold text-foreground">{item.label}</div>
              <button
                onClick={() => setToggles(prev => ({ ...prev, [item.label]: !prev[item.label] }))}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: toggles[item.label] ? accentColor : "var(--border)" }}
              >
                <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: toggles[item.label] ? "calc(100% - 20px)" : 4 }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}