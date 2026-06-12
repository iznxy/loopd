import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";

export default function Privacy() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [twoFA, setTwoFA] = useState(false);
  const [privateAcc, setPrivateAcc] = useState(false);
  const [show18, setShow18] = useState(false);
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [allowDuets, setAllowDuets] = useState(true);
  const [showChangePw, setShowChangePw] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: accentColor }}>
        <button onClick={() => navigate(-1)}><ChevronLeft size={22} color="#fff" /></button>
        <span className="text-base font-bold text-white">Privacy & Security</span>
        <div style={{ width: 22 }} />
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-6 px-4 pt-4 space-y-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold" style={{ background: `${accentColor}15`, color: accentColor }}>
          🔒 Account Secured
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {[
            { icon: "🔑", bg: "#ffd6d6", label: "Change Password", action: () => setShowChangePw(true), arrow: true },
            { icon: "🛡", bg: "#d4f5e9", label: "Two-Factor Auth", toggle: true, value: twoFA, onToggle: () => setTwoFA(!twoFA) },
            { icon: "📱", bg: "#fff3cd", label: "Active Sessions", sub: "2 devices", action: () => {}, arrow: true },
          ].map(item => (
            <div key={item.label} onClick={item.action} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 cursor-pointer">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: item.bg }}>{item.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{item.label}</div>
                {item.sub && <div className="text-xs text-muted-foreground">{item.sub}</div>}
              </div>
              {item.toggle ? (
                <button onClick={e => { e.stopPropagation(); item.onToggle(); }} className="relative w-11 h-6 rounded-full transition-colors" style={{ background: item.value ? accentColor : "var(--border)" }}>
                  <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: item.value ? "calc(100% - 20px)" : 4 }} />
                </button>
              ) : item.arrow ? <ChevronRight size={16} className="text-muted-foreground" /> : null}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {[
            { icon: "👁", bg: "#dbeeff", label: "Private Account", toggle: true, value: privateAcc, onToggle: () => setPrivateAcc(!privateAcc) },
            { icon: "🔞", bg: "#ffd6d6", label: "Show 18+ Content", toggle: true, value: show18, onToggle: () => setShow18(!show18) },
            { icon: "⬇️", bg: "#d4f5e9", label: "Allow Downloads", sub: "Let others download your loops", toggle: true, value: allowDownloads, onToggle: () => setAllowDownloads(!allowDownloads) },
            { icon: "🎵", bg: "#fff3cd", label: "Allow Duets", toggle: true, value: allowDuets, onToggle: () => setAllowDuets(!allowDuets) },
            { icon: "🚫", bg: "#ffd6d6", label: "Blocked Users", sub: "0 blocked", action: () => {}, arrow: true },
          ].map(item => (
            <div key={item.label} onClick={item.action} className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 cursor-pointer">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: item.bg }}>{item.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{item.label}</div>
                {item.sub && <div className="text-xs text-muted-foreground">{item.sub}</div>}
              </div>
              {item.toggle ? (
                <button onClick={e => { e.stopPropagation(); item.onToggle(); }} className="relative w-11 h-6 rounded-full transition-colors" style={{ background: item.value ? accentColor : "var(--border)" }}>
                  <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: item.value ? "calc(100% - 20px)" : 4 }} />
                </button>
              ) : item.arrow ? <ChevronRight size={16} className="text-muted-foreground" /> : null}
            </div>
          ))}
        </div>
      </div>

      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </div>
  );
}