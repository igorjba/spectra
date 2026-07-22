"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "spectra-theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// The DOM's data-theme attribute is the source of truth; the inline script sets
// it before paint. We read it through an external store so hydration stays
// consistent and no effect has to sync state.
function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  window.addEventListener("storage", onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onChange);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    readTheme,
    (): Theme => "dark",
  );

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", next); // notifies the store via MutationObserver
    root.style.colorScheme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode or storage disabled — theme still applies for the session.
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(readTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const ctx = use(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

/**
 * Script inline que resolve o tema antes da primeira pintura, evitando o flash
 * do tema errado. A escolha salva sempre vence; sem escolha, o padrão é escuro
 * — é o tema base do design system e o que os shaders assumem. Quem prefere
 * claro troca no cabeçalho e a preferência persiste.
 */
export const themeInitScript = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var s=localStorage.getItem(k);var t=s==="light"?"light":"dark";var r=document.documentElement;r.setAttribute("data-theme",t);r.style.colorScheme=t;}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;
