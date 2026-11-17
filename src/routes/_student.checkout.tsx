import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Banknote, Clock, Loader2, MapPin, ShoppingBag, Smartphone, Zap } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";
import { cartLines, estimatePrepMinutes, formatPrice } from "@/lib/order-logic";
import { DemoNotice, EmptyState, PageHeader, VegMark } from "@/components/canteeno/bits";
import { StudentGate } from "@/components/canteeno/student-gate";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";

export const Route = createFileRoute("/_student/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Canteeno" },
      { name: "description", content: "Choose a pickup time and place your canteen order." },
      { property: "og:title", content: "Checkout — Canteeno" },
      { property: "og:description", content: "Choose a pickup time and place your canteen order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="container-app py-8">
      <StudentGate title="Log in to place your order" description="Your cart is saved — log in and you'll come right back here.">
        {() => <Checkout />}
      </StudentGate>
    </div>
  ),
});

function slotOptions(eta: number) {
  const out: string[] = [];
  const start = new Date(Date.now() + (eta + 10) * 60_000);
  start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0);
  for (let i = 0; i < 8; i++) {
    const d = new Date(start.getTime() + i * 15 * 60_000);
    out.push(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
  }
  return out;
}

function Checkout() {
  const navigate = useNavigate();
  const cart = useApp((s) => s.cart);
  const foods = useApp((s) => s.foods);
  const allowUpi = useApp((s) => s.settings.allowUpi);
  const canteen = useApp((s) => s.canteens.find((c) => c.id === s.cart.canteenId));
  const queue = useApp((s) => s.orders.filter((o) => o.canteenId === s.cart.canteenId && ["placed", "accepted", "preparing"].includes(o.status)).length);
  const placeOrder = useApp((s) => s.placeOrder);
  const [when, setWhen] = useState<"asap" | "later">("asap");
  const [slot, setSlot] = useState<string>("");
  const [payment, setPayment] = useState<PaymentMethod>("counter");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines = cartLines(cart, foods);
  const eta = estimatePrepMinutes(lines.map((l) => ({ prepTime: l.food.prepTime, qty: l.qty })), queue);
  const slots = useMemo(() => slotOptions(eta), [eta]);
  const subtotal = lines.reduce((a, l) => a + l.total, 0);

  if (!canteen || lines.length === 0)
    return <EmptyState icon={<ShoppingBag />} title="Nothing to check out" description="Your cart is empty." action={<Button asChild><Link to="/canteens">Browse canteens</Link></Button>} />;

  const submit = () => {
    setError(null);
    if (when === "later" && !slot) return void setError("Pick a pickup time.");
    if (note.length > 140) return void setError("Keep the note under 140 characters.");
    setSubmitting(true);
    // Simulated network delay for the demo
    setTimeout(() => {
      const r = placeOrder({ paymentMethod: payment, note, pickupSlot: when === "asap" ? "asap" : slot });
      setSubmitting(false);
      if (!r.ok) {
        setError(r.error);
        toast.error(r.error);
        return;
      }
      toast.success("Order placed!", { description: `${r.order.orderNumber} sent to ${canteen.name}` });
      navigate({ to: "/order-confirmed/$orderId", params: { orderId: r.order.id } });
    }, 700);
  };

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3"><Link to="/cart"><ArrowLeft /> Back to cart</Link></Button>
      <PageHeader title="Checkout" description="Self-pickup at the canteen counter. No delivery." />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <section className="rounded-3xl border bg-card p-5 shadow-soft">
            <h2 className="mb-1 text-lg font-bold">Pickup location</h2>
            <div className="flex items-center gap-3">
              <img src={canteen.image} alt="" width={48} height={48} className="size-12 rounded-xl object-cover" />
              <div>
                <p className="font-semibold">{canteen.name}</p>
                <p className="inline-flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" /> {canteen.location}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-lg font-bold">When do you want it?</h2>
            <RadioGroup value={when} onValueChange={(v) => setWhen(v as "asap" | "later")} className="grid gap-3 sm:grid-cols-2">
              {[
                { v: "asap", icon: Zap, title: "As soon as possible", sub: `Ready in ~${eta} min` },
                { v: "later", icon: Clock, title: "Schedule pickup", sub: "Choose a time slot" },
              ].map((o) => (
                <Label key={o.v} htmlFor={`when-${o.v}`} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors", when === o.v ? "border-primary bg-secondary/60" : "hover:bg-muted/50")}>
                  <RadioGroupItem value={o.v} id={`when-${o.v}`} className="mt-1" />
                  <span>
                    <span className="flex items-center gap-1.5 font-semibold"><o.icon className="size-4 text-primary" /> {o.title}</span>
                    <span className="block text-sm font-normal text-muted-foreground">{o.sub}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
            {when === "later" && (
              <div className="mt-4 max-w-xs">
                <Label htmlFor="slot" className="mb-1.5 block">Pickup time</Label>
                <Select value={slot} onValueChange={setSlot}>
                  <SelectTrigger id="slot" aria-invalid={!!error && !slot}><SelectValue placeholder="Select a time" /></SelectTrigger>
                  <SelectContent>
                    {slots.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </section>

          <section className="rounded-3xl border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-lg font-bold">Payment</h2>
            <RadioGroup value={payment} onValueChange={(v) => setPayment(v as PaymentMethod)} className="grid gap-3 sm:grid-cols-2">
              {[
                { v: "counter", icon: Banknote, title: "Pay at counter", sub: "Cash or UPI when you pick up", disabled: false },
                { v: "upi", icon: Smartphone, title: "UPI (demo)", sub: allowUpi ? "Simulated — no money moves" : "Disabled by admin", disabled: !allowUpi },
              ].map((o) => (
                <Label key={o.v} htmlFor={`pay-${o.v}`} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors", payment === o.v ? "border-primary bg-secondary/60" : "hover:bg-muted/50", o.disabled && "cursor-not-allowed opacity-50")}>
                  <RadioGroupItem value={o.v} id={`pay-${o.v}`} className="mt-1" disabled={o.disabled} />
                  <span>
                    <span className="flex items-center gap-1.5 font-semibold"><o.icon className="size-4 text-primary" /> {o.title}</span>
                    <span className="block text-sm font-normal text-muted-foreground">{o.sub}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </section>

          <section className="rounded-3xl border bg-card p-5 shadow-soft">
            <Label htmlFor="note" className="text-lg font-bold">Note for the kitchen <span className="text-sm font-normal text-muted-foreground">(optional)</span></Label>
            <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Less spicy, no onion" className="mt-3" maxLength={160} />
            <p className={cn("mt-1 text-right text-xs", note.length > 140 ? "text-destructive" : "text-muted-foreground")}>{note.length}/140</p>
          </section>
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-20">
          <div className="rounded-3xl border bg-card p-5 shadow-card">
            <h2 className="text-lg font-bold">Order summary</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {lines.map((l) => (
                <li key={l.food.id} className="flex items-center gap-2">
                  <VegMark veg={l.food.isVeg} />
                  <span className="flex-1 truncate">{l.qty} × {l.food.name}</span>
                  <span className="tabular-nums">{formatPrice(l.total)}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Pickup fee</span><span className="font-semibold text-success">Free</span></div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-bold">Total</span>
              <span className="font-display text-2xl font-bold tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            {error && <p role="alert" className="mt-3 rounded-xl bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive">{error}</p>}
            <Button size="lg" className="mt-4 w-full" onClick={submit} disabled={submitting}>
              {submitting ? <><Loader2 className="animate-spin" /> Placing order…</> : `Place pickup order · ${formatPrice(subtotal)}`}
            </Button>
          </div>
          <DemoNotice>This is a demo order saved in your browser. No payment is charged and the canteen does not actually receive it.</DemoNotice>
        </aside>
      </div>
    </>
  );
}
