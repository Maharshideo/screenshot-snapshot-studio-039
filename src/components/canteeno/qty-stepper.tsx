import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QtyStepper({
  value,
  onChange,
  min = 0,
  max = 10,
  size = "md",
  className,
  label = "quantity",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  label?: string;
}) {
  const btn = cn(
    "grid place-items-center rounded-full text-primary transition-colors hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
    size === "sm" ? "size-7" : "size-8",
  );
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border border-primary/25 bg-card p-0.5 shadow-soft", className)}>
      <button type="button" className={btn} aria-label={`Decrease ${label}`} onClick={() => onChange(value - 1)} disabled={value <= min}>
        <Minus className="size-3.5" />
      </button>
      <span className={cn("min-w-6 text-center font-bold tabular-nums", size === "sm" ? "text-sm" : "text-base")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} aria-label={`Increase ${label}`} onClick={() => onChange(value + 1)} disabled={value >= max}>
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
