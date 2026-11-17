import { useEffect, useState, type ReactNode } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Star, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL } from "@/lib/order-logic";
import type { OrderStatus } from "@/lib/types";

export function VegMark({ veg, className }: { veg: boolean; className?: string }) {
  return (
    <span
      role="img"
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      title={veg ? "Veg" : "Non-veg"}
      className={cn(
        "inline-grid size-4 shrink-0 place-items-center rounded-[3px] border-[1.5px] bg-card",
        veg ? "border-veg" : "border-nonveg",
        className,
      )}
    >
      {veg ? (
        <span className="size-2 rounded-full bg-veg" />
      ) : (
        <span className="size-0 border-x-[4px] border-b-[7px] border-x-transparent border-b-nonveg" />
      )}
    </span>
  );
}

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold", className)}>
      <span className="inline-flex items-center gap-0.5 rounded-md bg-success px-1.5 py-0.5 text-xs text-primary-foreground">
        {value.toFixed(1)} <Star className="size-3 fill-current" aria-hidden />
      </span>
      {count !== undefined && <span className="text-xs font-normal text-muted-foreground">({count}+ demo)</span>}
    </span>
  );
}

export function Stars({ value, size = "sm", onChange }: { value: number; size?: "sm" | "lg"; onChange?: (v: number) => void }) {
  return (
    <span className="inline-flex items-center gap-0.5" role={onChange ? "radiogroup" : undefined} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Star className={cn(size === "lg" ? "size-7" : "size-4", n <= value ? "fill-highlight text-highlight" : "text-border")} aria-hidden />
        );
        return onChange ? (
          <button key={n} type="button" role="radio" aria-checked={n === value} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange(n)} className="cursor-pointer transition-transform hover:scale-110">
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </span>
  );
}

const STATUS_VARIANT: Record<OrderStatus, "info" | "warning" | "highlight" | "success" | "muted" | "danger" | "secondary"> = {
  placed: "info",
  accepted: "secondary",
  preparing: "warning",
  ready: "highlight",
  collected: "success",
  cancelled: "muted",
  rejected: "danger",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={cn("gap-1.5", className)}>
      {status === "ready" && <span className="size-1.5 animate-pulse rounded-full bg-highlight" />}
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function DemoBadge({ className, children = "Demo" }: { className?: string; children?: ReactNode }) {
  return (
    <Badge variant="demo" className={cn("gap-1", className)}>
      <FlaskConical className="size-3" aria-hidden />
      {children}
    </Badge>
  );
}

export function DemoNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2 rounded-xl border border-dashed border-highlight/40 bg-highlight-soft/60 px-3 py-2 text-xs text-foreground/80", className)}>
      <FlaskConical className="mt-0.5 size-3.5 shrink-0 text-highlight" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** Renders dates only on the client so server (UTC) and browser time zones never mismatch. */
export function TimeText({ iso, mode = "relative", className }: { iso: string; mode?: "relative" | "time" | "datetime" | "date"; className?: string }) {
  const mounted = useMounted();
  if (!mounted) return <span className={cn("inline-block min-w-12", className)}>&nbsp;</span>;
  const d = new Date(iso);
  const text =
    mode === "relative"
      ? `${formatDistanceToNowStrict(d)} ago`
      : mode === "time"
        ? format(d, "h:mm a")
        : mode === "date"
          ? format(d, "d MMM yyyy")
          : format(d, "d MMM, h:mm a");
  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {text}
    </time>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card/60 px-6 py-14 text-center", className)}>
      <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-secondary text-primary [&_svg]:size-7">{icon}</div>
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, action, className }: { eyebrow?: string; title: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-highlight">{eyebrow}</p>}
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, description, action, className }: { title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
