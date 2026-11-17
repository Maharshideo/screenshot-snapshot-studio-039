import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, ShoppingBag, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApp, useHydrated } from "@/store/app-store";
import { cartLines, estimatePrepMinutes, formatPrice } from "@/lib/order-logic";
import { EmptyState, PageHeader, VegMark } from "@/components/canteeno/bits";
import { QtyStepper } from "@/components/canteeno/qty-stepper";
import { PageSkeleton } from "@/components/canteeno/student-gate";
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

export const Route = createFileRoute("/_student/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Canteeno" },
      { name: "description", content: "Review your pickup order before checkout." },
      { property: "og:title", content: "Your cart — Canteeno" },
      { property: "og:description", content: "Review your pickup order before checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const hydrated = useHydrated();
  const cart = useApp((s) => s.cart);
  const foods = useApp((s) => s.foods);
  const canteen = useApp((s) => s.canteens.find((c) => c.id === s.cart.canteenId));
  const queue = useApp((s) => s.orders.filter((o) => o.canteenId === s.cart.canteenId && ["placed", "accepted", "preparing"].includes(o.status)).length);
  const { setQty, removeFromCart, clearCart } = useApp.getState();

  if (!hydrated) return <div className="container-app py-8"><PageSkeleton /></div>;

  const lines = cartLines(cart, foods);
  if (!canteen || lines.length === 0)
    return (
      <div className="container-app py-10">
        <EmptyState
          icon={<ShoppingBag />}
          title="Your cart is empty"
          description="Add something tasty from any canteen — your order will be ready for pickup."
          action={<Button asChild><Link to="/canteens"><Store /> Browse canteens</Link></Button>}
        />
      </div>
    );

  const subtotal = lines.reduce((a, l) => a + l.total, 0);
  const eta = estimatePrepMinutes(lines.map((l) => ({ prepTime: l.food.prepTime, qty: l.qty })), queue);
  const unavailable = lines.filter((l) => !l.food.inStock || !l.food.available);
  const open = canteen.isOpen && canteen.acceptingOrders;

  return (
    <div className="container-app py-8">
      <PageHeader
        title="Your cart"
        description="Pickup only — collect from the canteen counter."
        action={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive-soft" size="sm"><Trash2 /> Clear cart</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                <AlertDialogDescription>All {lines.length} items from {canteen.name} will be removed.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">Keep items</AlertDialogCancel>
                <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { clearCart(); toast.success("Cart cleared"); }}>
                  Clear cart
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-3xl border bg-card shadow-soft">
          <Link to="/canteens/$canteenId" params={{ canteenId: canteen.id }} className="flex items-center gap-3 border-b p-4 hover:bg-muted/50">
            <img src={canteen.image} alt="" width={56} height={56} className="size-14 rounded-2xl object-cover" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pickup from</p>
              <p className="font-display text-lg font-bold">{canteen.name}</p>
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" /> {canteen.location}</p>
            </div>
          </Link>
          <ul className="divide-y">
            {lines.map(({ food, qty, total }) => (
              <li key={food.id} className="flex items-center gap-3 p-4">
                <img src={food.image} alt="" width={64} height={64} loading="lazy" className="size-16 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <VegMark veg={food.isVeg} />
                    <p className="truncate font-semibold">{food.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatPrice(food.price)} each</p>
                  {!food.inStock && <p className="text-xs font-semibold text-destructive">Out of stock — remove to continue</p>}
                </div>
                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <QtyStepper size="sm" value={qty} onChange={(v) => setQty(food.id, v)} min={0} label={food.name} />
                  <span className="w-16 text-right font-bold tabular-nums">{formatPrice(total)}</span>
                  <Button variant="ghost" size="icon-sm" aria-label={`Remove ${food.name}`} onClick={() => removeFromCart(food.id)}>
                    <Trash2 className="text-muted-foreground" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t p-4">
            <Button asChild variant="ghost" size="sm"><Link to="/canteens/$canteenId" params={{ canteenId: canteen.id }}>+ Add more from {canteen.name}</Link></Button>
          </div>
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-20">
          <div className="rounded-3xl border bg-card p-5 shadow-card">
            <h2 className="text-lg font-bold">Bill summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Item total ({lines.reduce((n, l) => n + l.qty, 0)} items)</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Pickup fee</dt><dd className="font-semibold text-success">Free</dd></div>
            </dl>
            <Separator className="my-4" />
            <div className="flex items-baseline justify-between">
              <span className="font-bold">To pay</span>
              <span className="font-display text-2xl font-bold tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2.5 text-sm text-secondary-foreground">
              <Clock className="size-4" /> Estimated ready in <b>~{eta} min</b>
            </div>
            <Button asChild size="lg" className="mt-4 w-full" disabled={!open || unavailable.length > 0}>
              {open && unavailable.length === 0 ? (
                <Link to="/checkout">Proceed to checkout <ArrowRight /></Link>
              ) : (
                <span aria-disabled className="pointer-events-none opacity-50">{!open ? "Canteen not taking orders" : "Remove out-of-stock items"}</span>
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Demo prices · no real payment is taken</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
