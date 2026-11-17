import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, MapPin, Receipt, RotateCcw, Star, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";
import { canStudentCancel, formatPrice, isActive } from "@/lib/order-logic";
import { DemoNotice, EmptyState, StatusBadge, TimeText, VegMark } from "@/components/canteeno/bits";
import { OrderTimeline, PickupCode } from "@/components/canteeno/order-bits";
import { StudentGate } from "@/components/canteeno/student-gate";
import { ReviewDialog } from "@/components/canteeno/review-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_student/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order status — Canteeno" },
      { name: "description", content: "Track your canteen order from placed to ready for pickup." },
      { property: "og:title", content: "Order status — Canteeno" },
      { property: "og:description", content: "Track your canteen order from placed to ready for pickup." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <div className="container-app py-8">
      <StudentGate>{(u) => <OrderDetail userId={u.id} />}</StudentGate>
    </div>
  ),
});

const HEADLINE: Record<string, string> = {
  placed: "Waiting for the canteen to accept",
  accepted: "Accepted — in the queue",
  preparing: "Your food is being prepared",
  ready: "Ready for pickup!",
  collected: "Collected. Enjoy your meal!",
  cancelled: "This order was cancelled",
  rejected: "The canteen couldn't accept this order",
};

function OrderDetail({ userId }: { userId: string }) {
  const { orderId } = Route.useParams();
  const order = useApp((s) => s.orders.find((o) => o.id === orderId && o.userId === userId));
  const canteen = useApp((s) => s.canteens.find((c) => c.id === order?.canteenId));
  const cancelOrder = useApp((s) => s.cancelOrder);
  const reorder = useApp((s) => s.reorder);
  const navigate = useNavigate();

  if (!order) return <EmptyState icon={<Receipt />} title="Order not found" action={<Button asChild><Link to="/orders">My orders</Link></Button>} />;
  const ready = order.status === "ready";

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3"><Link to="/orders"><ArrowLeft /> All orders</Link></Button>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className={`rounded-3xl p-6 shadow-card ${ready ? "bg-highlight text-highlight-foreground" : "bg-primary text-primary-foreground"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-sm opacity-80">{order.orderNumber}</p>
              <StatusBadge status={order.status} className="bg-card" />
            </div>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">{HEADLINE[order.status]}</h1>
            {isActive(order.status) && (
              <p className="mt-2 inline-flex items-center gap-1.5 opacity-90">
                <Clock className="size-4" />
                {ready ? `Collect within ${useApp.getState().settings.pickupHoldMinutes} min` : order.pickupSlot === "asap" ? `Estimated preparation ~${order.prepMinutes} min` : `Scheduled pickup at ${order.pickupSlot}`}
              </p>
            )}
            <div className="mt-6 rounded-2xl bg-card p-4 text-foreground">
              <OrderTimeline order={order} orientation="horizontal" />
            </div>
          </section>

          <section className="rounded-3xl border bg-card p-5 shadow-soft">
            <h2 className="mb-4 text-lg font-bold">Progress</h2>
            <OrderTimeline order={order} />
          </section>

          <section className="rounded-3xl border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-lg font-bold">Items</h2>
            <ul className="space-y-2 text-sm">
              {order.items.map((l) => (
                <li key={l.foodId} className="flex items-center gap-2">
                  <VegMark veg={l.isVeg} />
                  <span className="flex-1">{l.qty} × {l.name}</span>
                  <span className="tabular-nums">{formatPrice(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            {order.note && <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-sm"><b>Note:</b> {order.note}</p>}
            <Separator className="my-4" />
            <div className="flex justify-between font-bold"><span>Total · {order.paymentMethod === "counter" ? "Pay at counter" : "UPI (demo)"}</span><span className="tabular-nums">{formatPrice(order.total)}</span></div>
            <p className="mt-1 text-xs text-muted-foreground">Placed <TimeText iso={order.placedAt} mode="datetime" /></p>
          </section>
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-20">
          {isActive(order.status) && (
            <div className="rounded-3xl border bg-card p-5 text-center shadow-card">
              <p className="mb-3 text-sm font-semibold">Show at the counter</p>
              <PickupCode code={order.orderNumber} />
              <p className="mt-2 text-xs text-muted-foreground">Placeholder code — not scannable in this demo.</p>
            </div>
          )}
          {canteen && (
            <Link to="/canteens/$canteenId" params={{ canteenId: canteen.id }} className="flex items-center gap-3 rounded-3xl border bg-card p-4 shadow-soft hover:shadow-card">
              <img src={canteen.image} alt="" width={48} height={48} className="size-12 rounded-xl object-cover" />
              <div>
                <p className="font-semibold">{canteen.name}</p>
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" /> {canteen.location}</p>
              </div>
            </Link>
          )}
          <div className="space-y-2">
            {canStudentCancel(order) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive-soft" className="w-full"><XCircle /> Cancel order</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel {order.orderNumber}?</AlertDialogTitle>
                    <AlertDialogDescription>You can cancel until the canteen accepts your order.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">Keep order</AlertDialogCancel>
                    <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => (cancelOrder(order.id) ? toast.success("Order cancelled") : toast.error("The canteen already accepted this order."))}>
                      Cancel order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {!isActive(order.status) && (
              <Button
                variant="soft"
                className="w-full"
                onClick={() => {
                  const r = reorder(order.id);
                  if (!r.added) return void toast.error("None of these items are available right now.");
                  toast.success("Items added to cart");
                  navigate({ to: "/cart" });
                }}
              >
                <RotateCcw /> Reorder
              </Button>
            )}
            {order.status === "collected" && !order.reviewed && (
              <ReviewDialog canteenId={order.canteenId} orderId={order.id} trigger={<Button variant="outline" className="w-full"><Star /> Rate this order</Button>} />
            )}
          </div>
          <DemoNotice>Status updates come from the staff dashboard in this browser — there are no live server updates yet.</DemoNotice>
        </aside>
      </div>
    </>
  );
}
