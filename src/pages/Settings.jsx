import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import ThemeModal from "@/components/modals/ThemeModal";

export default function Settings() {
  const navigate = useNavigate();
  const { accentColor, darkMode, setDarkMode } = useTheme();
  const [showTheme, setShowTheme] = useState(false);

  async function logout() {
    base44.auth.logout("/login");
  }

  const groups = [
    {
      label: "Account",
      items: [
        { icon: "👤", bg: "#d4f5e9", color: "#0a6b4f", label: "Edit Profile", sub: "Name, username, bio, photo", action: () => navigate("/profile") },
        { icon: "🔒", bg: "#dbeeff", color: "#1560a0", label: "Privacy & Security", sub: "Password, 2FA, sessions", action: () => navigate("/privacy") },
        { icon: "🔔", bg: "#fff3cd", color: "#8a6300", label: "Notifications", sub: "Likes, comments, tips, DMs", action: () => navigate("/notif-settings") },
      ],
    },
    {
      label: "Appearance",
      items: [
        { icon: "🎨", bg: "#feeaff", color: "#892ba0", label: "Theme & Colors", sub: "Pick your style", action: () => setShowTheme(true) },
        { icon: "🌙", bg: "#e8e8e8", color: "#333", label: "Dark Mode", toggle: true, value: darkMode, onToggle: () => setDarkMode(!darkMode) },
        { icon: "🍇", bg: "#e9d5ff", color: "#6b21a8", label: "Replay Intro", sub: "Watch the Vine nostalgia reel", action: () => { localStorage.setItem("loopd_new_user", "1"); window.location.href = "/"; } },
      ],
    },
    {
      label: "Creator",
      items: [
        { icon: "💰", bg: "#fff3cd", color: "#8a6300", label: "Monetization", action: () => navigate("/earn") },
        { icon: "📊", bg: "#d4f5e9", color: "#0a6b4f", label: "Analytics", action: () => navigate("/analytics") },
      ],
    },
    {
      label: "Support",
      items: [
        { icon: "❓", bg: "#dbeeff", color: "#1560a0", label: "Help & Support", action: () => navigate("/help") },
        { icon: "🚪", bg: "#ffd6d6", color: "#a00", label: "Log Out", labelColor: "#f04e4e", action: logout },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: accentColor }}>
        <button onClick={() => navigate(-1)}><ChevronLeft size={22} color="#fff" /></button>
        <span className="text-base font-bold text-white">Settings</span>
        <div style={{ width: 22 }} />
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-6 px-4 pt-4 space-y-4">
        {groups.map(g => (
          <div key={g.label}>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{g.label}</div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {g.items.map((item, i) => (
                <div
                  key={item.label}
                  onClick={item.toggle ? undefined : item.action}
                  className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 cursor-pointer active:bg-muted/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: item.bg }}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: item.labelColor || "var(--foreground)" }}>{item.label}</div>
                    {item.sub && <div className="text-xs text-muted-foreground mt-0.5">{item.sub}</div>}
                  </div>
                  {item.toggle ? (
                    <button
                      onClick={item.onToggle}
                      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                      style={{ background: item.value ? accentColor : "var(--border)" }}
                    >
                      <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: item.value ? "calc(100% - 20px)" : 4 }} />
                    </button>
                  ) : (
                    <ChevronRight size={16} className="text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showTheme && <ThemeModal onClose={() => setShowTheme(false)} />}
    </div>
  );
}