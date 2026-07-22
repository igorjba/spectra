"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Mudar para o tema claro" : "Mudar para o tema escuro"}
      className={cn(
        "relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground ring-1 ring-border transition-colors duration-200 hover:text-foreground hover:ring-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      {/* Keep both icons mounted; cross-fade avoids a hydration flash. */}
      <Sun
        className={cn(
          "absolute h-[1.05rem] w-[1.05rem] transition-all duration-300 ease-out-back",
          !isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 -rotate-90 opacity-0",
        )}
      />
      <Moon
        className={cn(
          "absolute h-[1.05rem] w-[1.05rem] transition-all duration-300 ease-out-back",
          isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 rotate-90 opacity-0",
        )}
      />
    </button>
  );
}
