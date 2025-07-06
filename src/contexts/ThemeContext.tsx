import React, { useEffect, useState, useMemo } from "react";
import { saveUserPreferences, loadUserPreferences } from "@/utils/localStorage";
import { ThemeContext, type Theme } from "./themeContext";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const prefs = loadUserPreferences();
    return prefs.theme;
  });

  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    saveUserPreferences({ theme: newTheme });
  };

  useEffect(() => {
    const updateActualTheme = () => {
      let resolvedTheme: "light" | "dark";

      if (theme === "auto") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        resolvedTheme = prefersDark ? "dark" : "light";
      } else {
        resolvedTheme = theme;
      }

      setActualTheme(resolvedTheme);

      // Apply theme to document
      const root = document.documentElement;
      if (resolvedTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    updateActualTheme();

    // Listen for system theme changes when theme is "auto"
    if (theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateActualTheme);
      return () => mediaQuery.removeEventListener("change", updateActualTheme);
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      actualTheme,
      setTheme: updateTheme,
    }),
    [theme, actualTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
