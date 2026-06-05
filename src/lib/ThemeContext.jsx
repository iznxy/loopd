import React, { createContext, useContext, useState, useEffect } from "react";

const THEME_ACCENTS = {
  default: "#00c896",
  sunset: "#ff6b35",
  ocean: "#0077ff",
  grape: "#9b59b6",
  rose: "#e91e8c",
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("loopd_theme") || "default");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("loopd_dark") === "true");

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("loopd_dark", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("loopd_theme", theme);
  }, [theme]);

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