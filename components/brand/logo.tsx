import { cn } from "@/lib/utils";

/**
 * Spectra mark — a spectral bar field, read left-to-right like a spectrogram.
 * Bars carry the brand hue arc; the wordmark stays in the current text color.
 */
export function LogoMark({ className }: { className?: string }) {
  const bars = [
    { x: 1, h: 8, c: "var(--spectra-1)" },
    { x: 5.5, h: 14, c: "var(--spectra-2)" },
    { x: 10, h: 20, c: "var(--spectra-3)" },
    { x: 14.5, h: 12, c: "var(--spectra-4)" },
    { x: 19, h: 16, c: "var(--spectra-5)" },
  ];
  return (
    <svg
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
    >
      {bars.map((b) => (
        <rect
          key={b.x}
          x={b.x}
          y={(22 - b.h) / 2}
          width={2.4}
          height={b.h}
          rx={1.2}
          fill={b.c}
        />
      ))}
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWordmark && (
        <span className="font-display text-[1.05rem] font-semibold tracking-tight text-foreground">
          Spectra
        </span>
      )}
    </span>
  );
}
