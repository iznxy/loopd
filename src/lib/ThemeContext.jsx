import React, { createContext, useContext, useState, useEffect } from "react";

const THEME_ACCENTS = {
  default: "#00c896",
  sunset: "#ff6b35",
  ocean: "#0077ff",
  grape: "#9b59b6",
  rose: "#e91e8c",
};

const ThemeContext = createContext();

function applyDarkMode(dark) {
  const root = document.documentElement;
  if (dark) {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem("loopd_theme") || "default");
  const [darkMode, setDarkModeState] = useState(() => {
    const stored = localStorage.getItem("loopd_dark");
    const dark = stored === "true";
    // Apply immediately before first render to avoid flash
    applyDarkMode(dark);
    return dark;
  });

  function setDarkMode(val) {
    const dark = typeof val === "function" ? val(darkMode) : val;
    applyDarkMode(dark);
    localStorage.setItem("loopd_dark", String(dark));
    setDarkModeState(dark);
  }

  function setTheme(val) {
    localStorage.setItem("loopd_theme", val);
    setThemeState(val);
  }

  const accentColor = THEME_ACCENTS[theme] || "#00c896";

  return (
    <ThemeContext.Provider value={{ theme, setTheme, darkMode, setDarkMode, accentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}