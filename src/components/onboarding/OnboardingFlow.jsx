import React, { useState, useEffect } from "react";
import { ChevronRight, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/lib/ThemeContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Country -> language map (major countries)
const COUNTRY_LANG = {
  US: { lang: "English", code: "en", flag: "🇺🇸" },
  GB: { lang: "English", code: "en", flag: "🇬🇧" },
  CA: { lang: "English", code: "en", flag: "🇨🇦" },
  AU: { lang: "English", code: "en", flag: "🇦🇺" },
  IN: { lang: "Hindi", code: "hi", flag: "🇮🇳" },
  PK: { lang: "Urdu", code: "ur", flag: "🇵🇰" },
  BD: { lang: "Bengali", code: "bn", flag: "🇧🇩" },
  SA: { lang: "Arabic", code: "ar", flag: "🇸🇦" },
  AE: { lang: "Arabic", code: "ar", flag: "🇦🇪" },
  EG: { lang: "Arabic", code: "ar", flag: "🇪🇬" },
  TR: { lang: "Turkish", code: "tr", flag: "🇹🇷" },
  ID: { lang: "Indonesian", code: "id", flag: "🇮🇩" },
  BR: { lang: "Portuguese", code: "pt", flag: "🇧🇷" },
  PT: { lang: "Portuguese", code: "pt", flag: "🇵🇹" },
  ES: { lang: "Spanish", code: "es", flag: "🇪🇸" },
  MX: { lang: "Spanish", code: "es", flag: "🇲🇽" },
  CO: { lang: "Spanish", code: "es", flag: "🇨🇴" },
  AR: { lang: "Spanish", code: "es", flag: "🇦🇷" },
  FR: { lang: "French", code: "fr", flag: "🇫🇷" },
  DE: { lang: "German", code: "de", flag: "🇩🇪" },
  IT: { lang: "Italian", code: "it", flag: "🇮🇹" },
  RU: { lang: "Russian", code: "ru", flag: "🇷🇺" },
  CN: { lang: "Chinese", code: "zh", flag: "🇨🇳" },
  JP: { lang: "Japanese", code: "ja", flag: "🇯🇵" },
  KR: { lang: "Korean", code: "ko", flag: "🇰🇷" },
  PH: { lang: "Filipino", code: "fil", flag: "🇵🇭" },
  NG: { lang: "English", code: "en", flag: "🇳🇬" },
  GH: { lang: "English", code: "en", flag: "🇬🇭" },
  ZA: { lang: "English", code: "en", flag: "🇿🇦" },
  KE: { lang: "Swahili", code: "sw", flag: "🇰🇪" },
  IE: { lang: "English", code: "en", flag: "🇮🇪" },
  NL: { lang: "Dutch", code: "nl", flag: "🇳🇱" },
  PL: { lang: "Polish", code: "pl", flag: "🇵🇱" },
  TH: { lang: "Thai", code: "th", flag: "🇹🇭" },
  VN: { lang: "Vietnamese", code: "vi", flag: "🇻🇳" },
  MY: { lang: "Malay", code: "ms", flag: "🇲🇾" },
  AF: { lang: "Dari/Pashto", code: "ps", flag: "🇦🇫" },
  IR: { lang: "Persian", code: "fa", flag: "🇮🇷" },
};

const ALL_LANGUAGES = [
  { lang: "English", code: "en", flag: "🇺🇸" },
  { lang: "Urdu", code: "ur", flag: "🇵🇰" },
  { lang: "Hindi", code: "hi", flag: "🇮🇳" },
  { lang: "Arabic", code: "ar", flag: "🇸🇦" },
  { lang: "Spanish", code: "es", flag: "🇪🇸" },
  { lang: "French", code: "fr", flag: "🇫🇷" },
  { lang: "Portuguese", code: "pt", flag: "🇧🇷" },
  { lang: "German", code: "de", flag: "🇩🇪" },
  { lang: "Turkish", code: "tr", flag: "🇹🇷" },
  { lang: "Indonesian", code: "id", flag: "🇮🇩" },
  { lang: "Bengali", code: "bn", flag: "🇧🇩" },
  { lang: "Russian", code: "ru", flag: "🇷🇺" },
  { lang: "Chinese", code: "zh", flag: "🇨🇳" },
  { lang: "Japanese", code: "ja", flag: "🇯🇵" },
  { lang: "Korean", code: "ko", flag: "🇰🇷" },
  { lang: "Filipino", code: "fil", flag: "🇵🇭" },
  { lang: "Swahili", code: "sw", flag: "🇰🇪" },
  { lang: "Dutch", code: "nl", flag: "🇳🇱" },
  { lang: "Italian", code: "it", flag: "🇮🇹" },
  { lang: "Vietnamese", code: "vi", flag: "🇻🇳" },
  { lang: "Thai", code: "th", flag: "🇹🇭" },
  { lang: "Persian", code: "fa", flag: "🇮🇷" },
  { lang: "Polish", code: "pl", flag: "🇵🇱" },
  { lang: "Malay", code: "ms", flag: "🇲🇾" },
];

const GENDERS = [
  { id: "male", label: "Male", emoji: "👨" },
  { id: "female", label: "Female", emoji: "👩" },
  { id: "nonbinary", label: "Non-binary", emoji: "🧑" },
  { id: "prefer_not", label: "Prefer not to say", emoji: "🤐" },
];

const STEPS = ["language", "gender", "dob"];

export default function OnboardingFlow({ onComplete }) {
  const { accentColor } = useTheme();
  const { setLanguage } = useLanguage();
  const [step, setStep] = useState(0);
  const [detectedLang, setDetectedLang] = useState(null);
  const [selectedLang, setSelectedLang] = useState(null);
  const [gender, setGender] = useState(null);
  const [dob, setDob] = useState({ day: "", month: "", year: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Detect country via IP
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(data => {
        const countryCode = data.country_code;
        const lang = COUNTRY_LANG[countryCode] || { lang: "English", code: "en", flag: "🌐" };
        setDetectedLang(lang);
        setSelectedLang(lang);
      })
      .catch(() => {
        const fallback = { lang: "English", code: "en", flag: "🌐" };
        setDetectedLang(fallback);
        setSelectedLang(fallback);
      });
  }, []);

  async function finish() {
    setSaving(true);
    const dobStr = dob.year && dob.month && dob.day
      ? `${dob.year}-${String(dob.month).padStart(2, "0")}-${String(dob.day).padStart(2, "0")}`
      : null;
    await base44.auth.updateMe({
      language: selectedLang?.code || "en",
      language_name: selectedLang?.lang || "English",
      gender,
      date_of_birth: dobStr,
      onboarding_complete: true,
    }).catch(() => {});
    // Apply the chosen language across the app (translates + caches)
    await setLanguage(selectedLang?.lang || "English").catch(() => {});
    onComplete();
  }

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  function canProceed() {
    if (currentStep === "language") return !!selectedLang;
    if (currentStep === "gender") return !!gender;
    if (currentStep === "dob") return true; // optional
    return true;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #111827 100%)" }}>

      {/* Progress dots */}
      <div className="absolute top-14 flex gap-2">
        {STEPS.map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full transition-all"
            style={{ background: i <= step ? accentColor : "rgba(255,255,255,0.2)", width: i === step ? 20 : 8 }} />
        ))}
      </div>

      <div className="w-full max-w-sm">
        {/* Language step */}
        {currentStep === "language" && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🌍</div>
              <h2 className="text-2xl font-bold text-white mb-2">Choose your language</h2>
              {detectedLang && (
                <p className="text-white/60 text-sm">
                  We detected <span className="text-white font-semibold">{detectedLang.flag} {detectedLang.lang}</span> based on your location
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto hide-scrollbar pb-2">
              {ALL_LANGUAGES.map(l => (
                <button
                  key={l.lang}
                  type="button"
                  onClick={() => setSelectedLang(l)}
                  className="flex items-center gap-2 px-3 py-3 rounded-2xl border-2 text-left transition-all"
                  style={{
                    borderColor: selectedLang?.lang === l.lang ? accentColor : "rgba(255,255,255,0.1)",
                    background: selectedLang?.lang === l.lang ? `${accentColor}20` : "rgba(255,255,255,0.05)",
                  }}
                >
                  <span className="text-xl">{l.flag}</span>
                  <span className="text-white text-sm font-medium truncate">{l.lang}</span>
                  {selectedLang?.lang === l.lang && <Check size={14} className="ml-auto flex-shrink-0" style={{ color: accentColor }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gender step */}
        {currentStep === "gender" && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">👤</div>
              <h2 className="text-2xl font-bold text-white mb-2">How do you identify?</h2>
              <p className="text-white/60 text-sm">This helps us personalise your experience</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GENDERS.map(g => (
                <button
                  key={g.id}
                  onClick={() => setGender(g.id)}
                  className="flex flex-col items-center gap-2 py-5 rounded-2xl border-2 transition-all"
                  style={{
                    borderColor: gender === g.id ? accentColor : "rgba(255,255,255,0.1)",
                    background: gender === g.id ? `${accentColor}20` : "rgba(255,255,255,0.05)",
                  }}
                >
                  <span className="text-3xl">{g.emoji}</span>
                  <span className="text-white text-sm font-medium">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date of birth step */}
        {currentStep === "dob" && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎂</div>
              <h2 className="text-2xl font-bold text-white mb-2">When's your birthday?</h2>
              <p className="text-white/60 text-sm">You must be 13+ to use Loopd</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-white/50 block mb-1.5 text-center">Day</label>
                <input
                  type="number" min="1" max="31" placeholder="DD"
                  value={dob.day}
                  onChange={e => setDob(d => ({ ...d, day: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-3 text-white text-center text-lg font-bold outline-none focus:border-white/50"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-white/50 block mb-1.5 text-center">Month</label>
                <input
                  type="number" min="1" max="12" placeholder="MM"
                  value={dob.month}
                  onChange={e => setDob(d => ({ ...d, month: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-3 text-white text-center text-lg font-bold outline-none focus:border-white/50"
                />
              </div>
              <div className="flex-1.5" style={{ flex: 1.5 }}>
                <label className="text-xs text-white/50 block mb-1.5 text-center">Year</label>
                <input
                  type="number" min="1900" max="2012" placeholder="YYYY"
                  value={dob.year}
                  onChange={e => setDob(d => ({ ...d, year: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-3 text-white text-center text-lg font-bold outline-none focus:border-white/50"
                />
              </div>
            </div>
            <p className="text-center text-white/40 text-xs mt-3">Optional — you can skip this</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => {
            if (isLastStep) finish();
            else setStep(s => s + 1);
          }}
          disabled={!canProceed() || saving}
          className="w-full mt-8 py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all"
          style={{ background: canProceed() ? accentColor : "rgba(255,255,255,0.1)" }}
        >
          {saving ? "Saving…" : isLastStep ? "Let's go! 🚀" : "Continue"}
          {!isLastStep && !saving && <ChevronRight size={18} />}
        </button>
        {!isLastStep && (
          <button onClick={() => setStep(s => s + 1)} className="w-full mt-3 py-2 text-white/40 text-sm font-medium">
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}