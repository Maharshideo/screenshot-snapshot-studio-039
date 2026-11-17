import { Check, ChefHat, ClipboardCheck, PackageCheck, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_FLOW, STATUS_LABEL } from "@/lib/order-logic";
import type { Order, OrderStatus } from "@/lib/types";
import { TimeText } from "./bits";

const ICONS: Record<string, typeof Check> = {
  placed: ShoppingBag,
  accepted: ClipboardCheck,
  preparing: ChefHat,
  ready: PackageCheck,
  collected: Check,
};

export function OrderTimeline({ order, orientation = "vertical" }: { order: Order; orientation?: "vertical" | "horizontal" }) {
  const stopped = order.status === "cancelled" || order.status === "rejected";
  const reachedIdx = stopped ? 0 : ORDER_FLOW.indexOf(order.status);
  const at = (s: OrderStatus) => order.history.find((h) => h.status === s)?.at;

  if (orientation === "horizontal") {
    return (
      <ol className="flex items-start" aria-label="Order progress">
        {ORDER_FLOW.map((s, i) => {
          const Icon = ICONS[s];
          const done = i <= reachedIdx && !stopped;
          const current = i === reachedIdx && !stopped && order.status !== "collected";
          return (
            <li key={s} className="flex flex-1 flex-col items-center text-center">
              <div className="flex w-full items-center">
                <span className={cn("h-0.5 flex-1", i === 0 ? "invisible" : i <= reachedIdx && !stopped ? "bg-primary" : "bg-border")} />
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-full border-2", done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground", current && "animate-pulse-ring border-highlight bg-highlight")}>
                  <Icon className="size-4" />
                </span>
                <span className={cn("h-0.5 flex-1", i === ORDER_FLOW.length - 1 ? "invisible" : i < reachedIdx && !stopped ? "bg-primary" : "bg-border")} />
              </div>
              <span className={cn("mt-2 text-[11px] font-semibold leading-tight sm:text-xs", done ? "text-foreground" : "text-muted-foreground")}>{STATUS_LABEL[s]}</span>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="relative space-y-0" aria-label="Order progress">
      {ORDER_FLOW.map((s, i) => {
        const Icon = ICONS[s];
        const done = i <= reachedIdx && !stopped;
        const current = i === reachedIdx && !stopped && order.status !== "collected";
        const time = at(s);
        return (
          <li key={s} className="relative flex gap-4 pb-6 last:pb-0">
            {i < ORDER_FLOW.length - 1 && (
              <span className={cn("absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-0.5", i < reachedIdx && !stopped ? "bg-primary" : "bg-border")} />
            )}
            <span className={cn("relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2 transition-colors", done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground", current && "animate-pulse-ring border-highlight bg-highlight text-highlight-foreground")}>
              <Icon className="size-4" />
            </span>
            <div className="pt-1.5">
              <p className={cn("font-semibold", !done && "text-muted-foreground")}>{STATUS_LABEL[s]}</p>
              {time && done && <TimeText iso={time} mode="time" className="text-xs text-muted-foreground" />}
              {current && <p className="text-xs font-medium text-highlight">In progress</p>}
            </div>
          </li>
        );
      })}
      {stopped && (
        <li className="mt-4 flex items-center gap-3 rounded-xl bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive">
          <X className="size-4" /> {STATUS_LABEL[order.status]}
          {order.reason && <span className="font-normal">— {order.reason}</span>}
        </li>
      )}
    </ol>
  );
}

/** Decorative QR-style code. Not scannable — a placeholder for a future signed pickup token. */
export function PickupCode({ code, size = 168, className }: { code: string; size?: number; className?: string }) {
  const n = 21;
  let seed = 0;
  for (const ch of code) seed = (seed * 33 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  const finder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    for (const [ox, oy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
      if (inBox(ox, oy)) {
        const dx = x - ox, dy = y - oy;
        return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) ? 1 : 0;
      }
    }
    return -1;
  };
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const f = finder(x, y);
      if (f === 1 || (f === -1 && rand() > 0.52)) cells.push([x, y]);
    }
  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} className="rounded-xl bg-card text-foreground" role="img" aria-label={`Pickup code ${code} (demo placeholder)`}>
        {cells.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill="currentColor" />
        ))}
      </svg>
      <span className="font-mono text-sm font-bold tracking-widest">{code}</span>
    </div>
  );
}
