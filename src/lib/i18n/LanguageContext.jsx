import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { STRINGS } from "./strings";

const RTL_LANGS = ["Arabic", "Urdu", "Persian", "Dari/Pashto", "Hebrew"];

const LanguageContext = createContext(null);

const cacheKey = (lang) => `loopd_i18n_${lang}`;

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("English");
  const [dict, setDict] = useState(STRINGS);
  const [ready, setReady] = useState(false);

  const applyDir = useCallback((lang) => {
    const isRtl = RTL_LANGS.includes(lang);
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, []);

  const loadLanguage = useCallback(async (lang) => {
    if (!lang || lang === "English") {
      setLanguage("English");
      setDict(STRINGS);
      applyDir("English");
      localStorage.setItem("loopd_lang", "English");
      return;
    }

    setLanguage(lang);
    applyDir(lang);
    localStorage.setItem("loopd_lang", lang);

    // Use cache only if it covers every current key (avoids stale/partial caches
    // leaving parts of the app stuck in English after new strings are added)
    const cached = localStorage.getItem(cacheKey(lang));
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const complete = Object.keys(STRINGS).every(
          (k) => typeof parsed[k] === "string" && parsed[k].length > 0
        );
        if (complete) {
          setDict({ ...STRINGS, ...parsed });
          return;
        }
      } catch { /* fall through to fetch */ }
    }

    try {
      const res = await base44.functions.invoke("translateStrings", {
        strings: STRINGS,
        targetLanguage: lang,
      });
      const translations = res?.data?.translations;
      if (translations && typeof translations === "object") {
        const merged = { ...STRINGS, ...translations };
        localStorage.setItem(cacheKey(lang), JSON.stringify(merged));
        setDict(merged);
      } else {
        setDict(STRINGS); // graceful fallback to English
      }
    } catch {
      setDict(STRINGS); // graceful fallback to English
    }
  }, [applyDir]);

  // On mount: prefer locally stored language, then the user's saved profile language
  useEffect(() => {
    (async () => {
      const local = localStorage.getItem("loopd_lang");
      if (local) {
        await loadLanguage(local);
      } else {
        try {
          const me = await base44.auth.me();
          const profileLang = me?.language_name || me?.language;
          if (profileLang && profileLang !== "en") await loadLanguage(profileLang);
        } catch { /* not logged in yet */ }
      }
      setReady(true);
    })();
  }, [loadLanguage]);

  const t = useCallback((key) => dict[key] ?? STRINGS[key] ?? key, [dict]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: loadLanguage, t, ready }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}