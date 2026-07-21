import { cn } from "@/lib/utils";
import { type LabStatus, labStatusLabel } from "@/lib/lab";

const styles: Record<LabStatus, string> = {
  live: "text-success before:bg-success before:shadow-[0_0_8px_currentColor]",
  building: "text-warning before:bg-warning",
  planned: "text-faint before:bg-faint",
};

export function StatusBadge({
  status,
  className,
}: {
  status: LabStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] before:h-1.5 before:w-1.5 before:rounded-full before:content-['']",
        styles[status],
        className,
      )}
    >
      {labStatusLabel[status]}
    </span>
  );
}
