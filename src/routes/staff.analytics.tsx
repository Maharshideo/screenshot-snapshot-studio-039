import { createFileRoute } from "@tanstack/react-router";
import { IndianRupee, ShoppingBag, Star } from "lucide-react";
import { useApp } from "@/store/app-store";
import { formatPrice } from "@/lib/order-logic";
import { DashHeader, Panel, StatCard } from "@/components/dashboard/dashboard-shell";
import { BarsChart, hourlySeries, RevenueChart, StatusPie, weeklySeries } from "@/components/dashboard/charts";
import { useStaffCanteen } from "@/components/dashboard/use-staff";
import { DemoNotice } from "@/components/canteeno/bits";

export const Route = createFileRoute("/staff/analytics")({
  component: StaffAnalytics,
});

function StaffAnalytics() {
  const canteen = useStaffCanteen();
  const orders = useApp((s) => s.orders).filter((o) => o.canteenId === canteen.id);
  const reviews = useApp((s) => s.reviews).filter((r) => r.canteenId === canteen.id);
  const week = weeklySeries(orders, canteen.id);
  const hourly = hourlySeries(orders, canteen.id);
  const weekRevenue = week.reduce((a, d) => a + d.revenue, 0);
  const weekOrders = week.reduce((a, d) => a + d.orders, 0);
  const rejected = orders.filter((o) => o.status === "rejected" || o.status === "cancelled").length;
  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "—";

  const itemCounts = new Map<string, number>();
  orders.filter((o) => o.status !== "rejected" && o.status !== "cancelled").forEach((o) => o.items.forEach((l) => itemCounts.set(l.name, (itemCounts.get(l.name) ?? 0) + l.qty)));
  const top = [...itemCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, qty]) => ({ name: name.length > 14 ? name.slice(0, 13) + "…" : name, qty }));

  return (
    <>
      <DashHeader title="Analytics" description={`${canteen.name} · last 7 days`} />
      <DemoNotice className="mb-5">Charts combine a generated demo baseline with orders placed in this browser. They are not real sales figures.</DemoNotice>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (7 days)" value={formatPrice(weekRevenue)} icon={IndianRupee} tone="highlight" hint="Demo estimate" />
        <StatCard label="Orders (7 days)" value={weekOrders} icon={ShoppingBag} hint={`~${Math.round(weekOrders / 7)} per day`} />
        <StatCard label="Avg order value" value={formatPrice(Math.round(weekRevenue / Math.max(weekOrders, 1)))} icon={IndianRupee} tone="info" />
        <StatCard label="Rating" value={avgRating} icon={Star} tone="warning" hint={`${reviews.length} reviews · ${rejected} rejected/cancelled`} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Revenue this week"><RevenueChart data={week} /></Panel>
        <Panel title="Orders by hour"><BarsChart data={hourly} x="hour" y="orders" label="Orders" /></Panel>
        <Panel title="Top items (from orders)">
          {top.length ? <BarsChart data={top} x="name" y="qty" label="Units" color="var(--chart-1)" /> : <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>}
        </Panel>
        <Panel title="Order outcomes"><StatusPie orders={orders} /></Panel>
      </div>
    </>
  );
}
