import { useState } from "react";
import { Clock, StickyNote, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge, TimeText } from "@/components/canteeno/bits";
import { formatPrice } from "@/lib/order-logic";
import type { Order } from "@/lib/types";
import { NextActionButton, RejectDialog } from "./order-drawer";

export function StaffOrderCard({ order, onOpen }: { order: Order; onOpen: () => void }) {
  const [rejecting, setRejecting] = useState(false);
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
        className={cn(
          "cursor-pointer rounded-2xl border bg-card p-4 shadow-soft transition-shadow hover:shadow-card focus-visible:outline-2 focus-visible:outline-ring",
          order.status === "placed" && "border-info/40 ring-1 ring-info/20",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono font-bold">{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">{order.studentName}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <ul className="mt-3 space-y-0.5 text-sm">
          {order.items.slice(0, 3).map((l) => (
            <li key={l.foodId}><b>{l.qty}×</b> {l.name}</li>
          ))}
          {order.items.length > 3 && <li className="text-muted-foreground">+{order.items.length - 3} more</li>}
        </ul>
        {order.note && <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-warning"><StickyNote className="size-3.5" /> Has a note</p>}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> <TimeText iso={order.placedAt} /> · {order.prepMinutes}m prep</span>
          <span className="text-sm font-bold text-foreground">{formatPrice(order.total)}</span>
        </div>
        <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
          {order.status === "placed" && (
            <Button size="sm" variant="destructive-soft" onClick={() => setRejecting(true)} aria-label={`Reject ${order.orderNumber}`}><X /> Reject</Button>
          )}
          <NextActionButton order={order} className="flex-1" />
        </div>
      </div>
      <RejectDialog order={order} open={rejecting} onOpenChange={setRejecting} />
    </>
  );
}
