import { useState } from "react";
import { Check, ChefHat, Clock, PackageCheck, Phone, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useApp } from "@/store/app-store";
import { formatPrice, nextStatus, STATUS_LABEL } from "@/lib/order-logic";
import { StatusBadge, TimeText, VegMark } from "@/components/canteeno/bits";
import { OrderTimeline } from "@/components/canteeno/order-bits";
import type { Order, OrderStatus } from "@/lib/types";

const NEXT_LABEL: Partial<Record<OrderStatus, { label: string; icon: typeof Check }>> = {
  placed: { label: "Accept order", icon: Check },
  accepted: { label: "Mark preparing", icon: ChefHat },
  preparing: { label: "Mark ready for pickup", icon: PackageCheck },
  ready: { label: "Mark collected", icon: Check },
};

/** Advances an order one step with a toast; shared by drawer and order cards. */
export function useOrderActions() {
  const setStatus = useApp((s) => s.setOrderStatus);
  return {
    advance: (order: Order) => {
      const to = nextStatus(order.status);
      if (!to) return;
      if (setStatus(order.id, to)) {
        if (to === "ready") toast.success(`${order.orderNumber} is ready`, { description: `${order.studentName} has been notified to pick up (demo notification).` });
        else toast.success(`${order.orderNumber} → ${STATUS_LABEL[to]}`);
      } else toast.error("That status change isn't allowed.");
    },
    reject: (order: Order, reason: string) => {
      if (setStatus(order.id, "rejected", reason)) toast.success(`${order.orderNumber} rejected`);
      else toast.error("Only new orders can be rejected.");
    },
  };
}

export function NextActionButton({ order, size = "sm", className }: { order: Order; size?: "sm" | "default"; className?: string }) {
  const { advance } = useOrderActions();
  const next = NEXT_LABEL[order.status];
  if (!next) return null;
  const Icon = next.icon;
  return (
    <Button size={size} variant={order.status === "preparing" ? "highlight" : "default"} className={className} onClick={(e) => { e.stopPropagation(); advance(order); }}>
      <Icon /> {next.label}
    </Button>
  );
}

export function RejectDialog({ order, open, onOpenChange }: { order: Order | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [reason, setReason] = useState("");
  const [err, setErr] = useState(false);
  const { reject } = useOrderActions();
  const presets = ["Item out of stock", "Kitchen closing soon", "Too many orders right now"];
  return (
    <AlertDialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setReason(""); setErr(false); } }}>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Reject {order?.orderNumber}?</AlertDialogTitle>
          <AlertDialogDescription>The student will see this reason.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <Button key={p} type="button" size="sm" variant={reason === p ? "default" : "outline"} onClick={() => { setReason(p); setErr(false); }}>{p}</Button>
          ))}
        </div>
        <Textarea value={reason} onChange={(e) => { setReason(e.target.value); setErr(false); }} placeholder="Reason for rejecting" aria-invalid={err} maxLength={120} />
        {err && <p className="text-xs text-destructive">Add a short reason.</p>}
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Back</AlertDialogCancel>
          <AlertDialogAction
            className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              if (reason.trim().length < 3) { e.preventDefault(); setErr(true); return; }
              if (order) reject(order, reason.trim());
            }}
          >
            Reject order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function OrderDrawer({ orderId, onOpenChange, readOnly = false }: { orderId: string | null; onOpenChange: (open: boolean) => void; readOnly?: boolean }) {
  const order = useApp((s) => s.orders.find((o) => o.id === orderId) ?? null);
  const canteen = useApp((s) => s.canteens.find((c) => c.id === order?.canteenId));
  const student = useApp((s) => s.students.find((u) => u.id === order?.userId));
  const setPrep = useApp((s) => s.setOrderPrep);
  const [prepDraft, setPrepDraft] = useState<string>("");
  const [rejecting, setRejecting] = useState(false);

  const editablePrep = order && ["placed", "accepted", "preparing"].includes(order.status) && !readOnly;

  return (
    <>
      <Sheet open={!!orderId} onOpenChange={(o) => { onOpenChange(o); if (!o) setPrepDraft(""); }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {order && (
            <>
              <SheetHeader className="text-left">
                <div className="flex items-center gap-2"><StatusBadge status={order.status} /></div>
                <SheetTitle className="font-mono text-xl">{order.orderNumber}</SheetTitle>
                <SheetDescription>
                  {canteen?.name} · placed <TimeText iso={order.placedAt} mode="datetime" />
                </SheetDescription>
              </SheetHeader>
              <div className="mt-5 space-y-5 px-4 pb-6">
                <div className="rounded-2xl bg-muted p-4 text-sm">
                  <p className="font-bold">{order.studentName}</p>
                  {student && <p className="text-muted-foreground">{student.rollNo} · {student.hostel}</p>}
                  {student && <p className="mt-1 inline-flex items-center gap-1 text-muted-foreground"><Phone className="size-3.5" /> {student.phone}</p>}
                  <p className="mt-2">Pickup: <b>{order.pickupSlot === "asap" ? "ASAP" : order.pickupSlot}</b> · {order.paymentMethod === "counter" ? "Pay at counter" : "UPI (demo)"}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-bold">Items</h3>
                  <ul className="space-y-1.5 text-sm">
                    {order.items.map((l) => (
                      <li key={l.foodId} className="flex items-center gap-2">
                        <VegMark veg={l.isVeg} />
                        <span className="flex-1"><b>{l.qty}×</b> {l.name}</span>
                        <span className="tabular-nums">{formatPrice(l.price * l.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  {order.note && <p className="mt-3 rounded-xl border border-warning/30 bg-warning-soft px-3 py-2 text-sm"><b>Note:</b> {order.note}</p>}
                  <Separator className="my-3" />
                  <div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
                </div>

                <div className="rounded-2xl border p-4">
                  <Label htmlFor="prep" className="flex items-center gap-1.5 text-sm font-bold"><Clock className="size-4" /> Preparation time</Label>
                  {editablePrep ? (
                    <form
                      className="mt-2 flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const n = Number(prepDraft);
                        if (!Number.isFinite(n) || n < 1 || n > 120) return toast.error("Enter 1–120 minutes");
                        setPrep(order.id, Math.round(n));
                        toast.success(`Prep time set to ${Math.round(n)} min`);
                        setPrepDraft("");
                      }}
                    >
                      <Input id="prep" type="number" min={1} max={120} placeholder={`${order.prepMinutes} min`} value={prepDraft} onChange={(e) => setPrepDraft(e.target.value)} />
                      <Button type="submit" variant="outline">Update</Button>
                    </form>
                  ) : (
                    <p className="mt-1 text-sm">{order.prepMinutes} min</p>
                  )}
                  {editablePrep && (
                    <div className="mt-2 flex gap-1.5">
                      {[5, 10, 15, 20].map((m) => (
                        <Button key={m} type="button" size="sm" variant="soft" onClick={() => { setPrep(order.id, m); toast.success(`Prep time set to ${m} min`); }}>{m}m</Button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-bold">Timeline</h3>
                  <OrderTimeline order={order} />
                </div>

                {!readOnly && (
                  <div className="sticky bottom-0 flex gap-2 border-t bg-background pt-4">
                    {order.status === "placed" && (
                      <Button variant="destructive-soft" onClick={() => setRejecting(true)}><X /> Reject</Button>
                    )}
                    <NextActionButton order={order} size="default" className="flex-1" />
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <RejectDialog order={order} open={rejecting} onOpenChange={setRejecting} />
    </>
  );
}
