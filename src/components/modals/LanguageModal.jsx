import React, { useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const LANGUAGES = [
  { lang: "English", flag: "🇺🇸" },
  { lang: "Spanish", flag: "🇪🇸" },
  { lang: "French", flag: "🇫🇷" },
  { lang: "German", flag: "🇩🇪" },
  { lang: "Portuguese", flag: "🇧🇷" },
  { lang: "Italian", flag: "🇮🇹" },
  { lang: "Arabic", flag: "🇸🇦" },
  { lang: "Urdu", flag: "🇵🇰" },
  { lang: "Hindi", flag: "🇮🇳" },
  { lang: "Bengali", flag: "🇧🇩" },
  { lang: "Turkish", flag: "🇹🇷" },
  { lang: "Indonesian", flag: "🇮🇩" },
  { lang: "Russian", flag: "🇷🇺" },
  { lang: "Chinese", flag: "🇨🇳" },
  { lang: "Japanese", flag: "🇯🇵" },
  { lang: "Korean", flag: "🇰🇷" },
  { lang: "Filipino", flag: "🇵🇭" },
  { lang: "Swahili", flag: "🇰🇪" },
  { lang: "Dutch", flag: "🇳🇱" },
  { lang: "Vietnamese", flag: "🇻🇳" },
  { lang: "Thai", flag: "🇹🇭" },
  { lang: "Persian", flag: "🇮🇷" },
  { lang: "Polish", flag: "🇵🇱" },
  { lang: "Malay", flag: "🇲🇾" },
];

export default function LanguageModal({ onClose }) {
  const { accentColor } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [applying, setApplying] = useState(null);

  async function choose(lang) {
    setApplying(lang);
    await setLanguage(lang).catch(() => {});
    base44.auth.updateMe({ language_name: lang }).catch(() => {});
    setApplying(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md bg-card rounded-t-3xl max-h-[80vh] flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <span className="text-base font-bold text-foreground">Language</span>
          <button onClick={onClose}><X size={20} className="text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar p-3 grid grid-cols-2 gap-2">
          {LANGUAGES.map(l => {
            const active = language === l.lang;
            return (
              <button
                key={l.lang}
                type="button"
                onClick={() => choose(l.lang)}
                disabled={applying !== null}
                className="flex items-center gap-2 px-3 py-3 rounded-2xl border-2 text-left transition-all"
                style={{
                  borderColor: active ? accentColor : "var(--border)",
                  background: active ? `${accentColor}18` : "transparent",
                }}
              >
                <span className="text-xl">{l.flag}</span>
                <span className="text-foreground text-sm font-medium truncate flex-1">{l.lang}</span>
                {applying === l.lang ? (
                  <Loader2 size={14} className="animate-spin flex-shrink-0" style={{ color: accentColor }} />
                ) : active ? (
                  <Check size={14} className="flex-shrink-0" style={{ color: accentColor }} />
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="px-5 py-3 text-center text-xs text-muted-foreground flex-shrink-0 border-t border-border">
          Translations are powered by AI and cached for speed.
        </div>
      </div>
    </div>
  );
}