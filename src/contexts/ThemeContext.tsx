"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  let effective: "light" | "dark" = theme === "system" ? getSystemTheme() : theme;
  root.setAttribute("data-theme", effective);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const mountedRef = useRef(false);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize from localStorage or API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const local = typeof window !== "undefined" ? (localStorage.getItem("appearance_theme") as Theme | null) : null;
        if (local) {
          if (!cancelled) {
            setThemeState(local);
            const eff = local === "system" ? getSystemTheme() : local;
            setResolvedTheme(eff);
            if (typeof window !== "undefined") applyTheme(local);
          }
        } else {
          // Fetch from API
          const resp = await fetch("/api/preferences", { cache: "no-store" });
          if (resp.ok) {
            const data = await resp.json();
            const t: Theme | undefined = data?.preferences?.appearance?.theme ?? "system";
            if (!cancelled) {
              setThemeState(t);
              const eff = t === "system" ? getSystemTheme() : t;
              setResolvedTheme(eff);
              if (typeof window !== "undefined") applyTheme(t);
              localStorage.setItem("appearance_theme", t);
            }
          } else {
            // fallback
            const t: Theme = "system";
            setThemeState(t);
            setResolvedTheme(getSystemTheme());
            if (typeof window !== "undefined") applyTheme(t);
          }
        }
      } catch {
        const t: Theme = "system";
        setThemeState(t);
        setResolvedTheme(getSystemTheme());
        if (typeof window !== "undefined") applyTheme(t);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Respond to system changes when theme === 'system'
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const eff = getSystemTheme();
        setResolvedTheme(eff);
        applyTheme("system");
      }
    };
    try {
      mql.addEventListener("change", handler);
    } catch {
      // Safari
      // @ts-ignore
      mql.addListener(handler);
    }
    return () => {
      try {
        mql.removeEventListener("change", handler);
      } catch {
        // @ts-ignore
        mql.removeListener(handler);
      }
    };
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    const eff = t === "system" ? getSystemTheme() : t;
    setResolvedTheme(eff);
    if (typeof window !== "undefined") {
      applyTheme(t);
      localStorage.setItem("appearance_theme", t);
    }
    // Debounced save to API
    if (updateTimeout.current) clearTimeout(updateTimeout.current);
    updateTimeout.current = setTimeout(async () => {
      try {
        await fetch("/api/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appearance: { theme: t } }),
        });
      } catch {}
    }, 500);
  };

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme]);

  // Avoid flash by applying theme on first mount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      if (typeof window !== "undefined") applyTheme(theme);
    }
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
