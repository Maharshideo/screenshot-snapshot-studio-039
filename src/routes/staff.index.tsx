import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BellRing, ChefHat, Clock, IndianRupee, PackageX, ShoppingBag } from "lucide-react";
import { useApp } from "@/store/app-store";
import { formatPrice } from "@/lib/order-logic";
import { DashHeader, Panel, StatCard } from "@/components/dashboard/dashboard-shell";
import { StaffOrderCard } from "@/components/dashboard/order-card";
import { OrderDrawer } from "@/components/dashboard/order-drawer";
import { isToday, useStaffCanteen } from "@/components/dashboard/use-staff";
import { EmptyState, StatusBadge } from "@/components/canteeno/bits";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/")({
  component: StaffOverview,
});

function StaffOverview() {
  const canteen = useStaffCanteen();
  const allOrders = useApp((s) => s.orders);
  const allFoods = useApp((s) => s.foods);
  const patchFood = useApp((s) => s.patchFood);
  const [openId, setOpenId] = useState<string | null>(null);

  const orders = allOrders.filter((o) => o.canteenId === canteen.id);
  const today = orders.filter((o) => isToday(o.placedAt));
  const incoming = orders.filter((o) => o.status === "placed");
  const active = orders.filter((o) => ["accepted", "preparing", "ready"].includes(o.status));
  const revenue = today.filter((o) => o.status === "collected").reduce((a, o) => a + o.total, 0);
  const avgPrep = active.length ? Math.round(active.reduce((a, o) => a + o.prepMinutes, 0) / active.length) : canteen.prepTime;
  const outOfStock = allFoods.filter((f) => f.canteenId === canteen.id && !f.inStock);

  return (
    <>
      <DashHeader title={`Good day, ${canteen.name} team`} description="Live view of today's pickup orders (demo data stored in this browser)." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders today" value={today.length} hint={`${orders.filter((o) => o.status === "collected" && isToday(o.placedAt)).length} collected`} icon={ShoppingBag} />
        <StatCard label="Waiting to accept" value={incoming.length} hint="New orders need a response" icon={BellRing} tone="info" />
        <StatCard label="Revenue today" value={formatPrice(revenue)} hint="Collected orders · demo" icon={IndianRupee} tone="highlight" />
        <StatCard label="Avg prep time" value={`${avgPrep}m`} hint={`${active.length} in kitchen`} icon={Clock} tone="warning" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <Panel
          title={<span className="flex items-center gap-2">Incoming orders {incoming.length > 0 && <span className="grid min-w-6 place-items-center rounded-full bg-info px-1.5 text-xs text-primary-foreground">{incoming.length}</span>}</span>}
          action={<Button asChild size="sm" variant="ghost"><Link to="/staff/orders">All orders <ArrowRight /></Link></Button>}
        >
          {incoming.length === 0 ? (
            <EmptyState className="py-10" icon={<BellRing />} title="No new orders" description="New pickup orders will appear here." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {incoming.map((o) => <StaffOrderCard key={o.id} order={o} onOpen={() => setOpenId(o.id)} />)}
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="In the kitchen">
            {active.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing cooking right now.</p>
            ) : (
              <ul className="divide-y">
                {active.map((o) => (
                  <li key={o.id}>
                    <button type="button" onClick={() => setOpenId(o.id)} className="flex w-full cursor-pointer items-center gap-3 py-2.5 text-left">
                      <ChefHat className="size-4 text-muted-foreground" />
                      <span className="flex-1">
                        <span className="block font-mono text-sm font-bold">{o.orderNumber}</span>
                        <span className="block text-xs text-muted-foreground">{o.studentName} · {o.items.reduce((n, l) => n + l.qty, 0)} items</span>
                      </span>
                      <StatusBadge status={o.status} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title={<span className="flex items-center gap-2"><PackageX className="size-4 text-destructive" /> Out of stock</span>} action={<Button asChild size="sm" variant="ghost"><Link to="/staff/menu">Manage</Link></Button>}>
            {outOfStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">Everything is in stock.</p>
            ) : (
              <ul className="space-y-2">
                {outOfStock.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-2 text-sm">
                    <span>{f.name}</span>
                    <Switch checked={false} onCheckedChange={() => { patchFood(f.id, { inStock: true }); toast.success(`${f.name} back in stock`); }} aria-label={`Mark ${f.name} in stock`} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
      <OrderDrawer orderId={openId} onOpenChange={(o) => !o && setOpenId(null)} />
    </>
  );
}
