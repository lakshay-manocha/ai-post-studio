import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
const KEY = "theme";

interface Ctx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: "light" | "dark";
}

const ThemeCtx = createContext<Ctx | null>(null);

function applyTheme(theme: Theme): "light" | "dark" {
  const root = document.documentElement;
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = theme === "system" ? (sysDark ? "dark" : "light") : theme;
  root.classList.toggle("dark", resolved === "dark");
  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Theme | null) ?? "system";
    setThemeState(saved);
    setResolved(applyTheme(saved));

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const t = (localStorage.getItem(KEY) as Theme | null) ?? "system";
      if (t === "system") setResolved(applyTheme("system"));
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = (t: Theme) => {
    localStorage.setItem(KEY, t);
    setThemeState(t);
    setResolved(applyTheme(t));
  };

  return <ThemeCtx.Provider value={{ theme, setTheme, resolved }}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
