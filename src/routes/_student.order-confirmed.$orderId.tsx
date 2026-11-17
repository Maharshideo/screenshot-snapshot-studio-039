import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, MapPin, Receipt } from "lucide-react";
import { useApp } from "@/store/app-store";
import { formatPrice } from "@/lib/order-logic";
import { DemoNotice, EmptyState, VegMark } from "@/components/canteeno/bits";
import { PickupCode } from "@/components/canteeno/order-bits";
import { StudentGate } from "@/components/canteeno/student-gate";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_student/order-confirmed/$orderId")({
  head: () => ({
    meta: [
      { title: "Order confirmed — Canteeno" },
      { name: "description", content: "Your pickup order has been placed." },
      { property: "og:title", content: "Order confirmed — Canteeno" },
      { property: "og:description", content: "Your pickup order has been placed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <div className="container-app max-w-2xl py-10">
      <StudentGate>{(u) => <Confirmed userId={u.id} />}</StudentGate>
    </div>
  ),
});

function Confirmed({ userId }: { userId: string }) {
  const { orderId } = Route.useParams();
  const order = useApp((s) => s.orders.find((o) => o.id === orderId && o.userId === userId));
  const canteen = useApp((s) => s.canteens.find((c) => c.id === order?.canteenId));
  if (!order || !canteen) return <EmptyState icon={<Receipt />} title="Order not found" action={<Button asChild><Link to="/orders">My orders</Link></Button>} />;

  return (
    <div className="text-center">
      <div className="mx-auto grid size-20 animate-pop place-items-center rounded-full bg-success-soft text-success">
        <CheckCircle2 className="size-11" />
      </div>
      <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">Order placed!</h1>
      <p className="mt-2 text-muted-foreground">
        We&apos;ve sent your order to <b className="text-foreground">{canteen.name}</b>. You&apos;ll be notified as it moves along.
      </p>

      <div className="mt-8 overflow-hidden rounded-3xl border bg-card text-left shadow-card">
        <div className="flex flex-col items-center gap-4 bg-cream p-6 sm:flex-row sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order number</p>
            <p className="font-mono text-2xl font-bold">{order.orderNumber}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm"><Clock className="size-4 text-highlight" /> {order.pickupSlot === "asap" ? <>Estimated ready in <b>~{order.prepMinutes} min</b></> : <>Scheduled for <b>{order.pickupSlot}</b></>}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-4" /> {canteen.location}</p>
          </div>
          <PickupCode code={order.orderNumber} size={132} />
        </div>
        <div className="p-6">
          <ul className="space-y-2 text-sm">
            {order.items.map((l) => (
              <li key={l.foodId} className="flex items-center gap-2">
                <VegMark veg={l.isVeg} />
                <span className="flex-1">{l.qty} × {l.name}</span>
                <span className="tabular-nums">{formatPrice(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="flex justify-between font-bold"><span>Total ({order.paymentMethod === "counter" ? "pay at counter" : "UPI demo"})</span><span className="tabular-nums">{formatPrice(order.total)}</span></div>
          <div className="mt-5 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
            <p className="font-bold">Pickup instructions</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-5">
              <li>Wait for the &ldquo;Ready for Pickup&rdquo; notification.</li>
              <li>Go to the {canteen.name} pickup counter.</li>
              <li>Show this pickup code or tell them your order number.</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="lg"><Link to="/orders/$orderId" params={{ orderId: order.id }}>Track order</Link></Button>
        <Button asChild size="lg" variant="outline"><Link to="/">Back to home</Link></Button>
      </div>
      <DemoNotice className="mx-auto mt-6 max-w-md text-left">Demo order — to see it move, open the Canteen staff dashboard ({canteen.name}) and accept it.</DemoNotice>
    </div>
  );
}
