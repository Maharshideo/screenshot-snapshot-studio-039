import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, IndianRupee, Store, Users } from "lucide-react";
import { useApp } from "@/store/app-store";
import { formatPrice, isActive } from "@/lib/order-logic";
import { DashHeader, Panel, StatCard } from "@/components/dashboard/dashboard-shell";
import { BarsChart, RevenueChart, weeklySeries } from "@/components/dashboard/charts";
import { DemoNotice, Stars, StatusBadge, TimeText } from "@/components/canteeno/bits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const students = useApp((s) => s.students);
  const canteens = useApp((s) => s.canteens);
  const orders = useApp((s) => s.orders);
  const reviews = useApp((s) => s.reviews);
  const revenue = orders.filter((o) => o.status === "collected").reduce((a, o) => a + o.total, 0);
  const week = weeklySeries(orders, "platform");
  const perCanteen = canteens
    .map((c) => ({ name: c.code, orders: orders.filter((o) => o.canteenId === c.id).length }))
    .filter((d) => d.orders > 0);
  const recent = [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)).slice(0, 6);
  const flagged = reviews.filter((r) => r.status === "flagged");

  return (
    <>
      <DashHeader title="Platform overview" description="Everything across campus at a glance." />
      <DemoNotice className="mb-5">All numbers are demo statistics from this browser&apos;s sample data — not real campus figures.</DemoNotice>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered students" value={students.length} hint={`${students.filter((s) => s.status === "suspended").length} suspended`} icon={Users} />
        <StatCard label="Canteens" value={canteens.length} hint={`${canteens.filter((c) => c.isOpen).length} open now`} icon={Store} tone="info" />
        <StatCard label="Orders" value={orders.length} hint={`${orders.filter((o) => isActive(o.status)).length} active`} icon={ClipboardList} tone="warning" />
        <StatCard label="Revenue (collected)" value={formatPrice(revenue)} hint="Demo" icon={IndianRupee} tone="highlight" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Platform revenue · 7 days (demo baseline)"><RevenueChart data={week} /></Panel>
        <Panel title="Orders by canteen"><BarsChart data={perCanteen} x="name" y="orders" label="Orders" /></Panel>
        <Panel title="Recent orders" action={<Button asChild size="sm" variant="ghost"><Link to="/admin/orders">All <ArrowRight /></Link></Button>}>
          <ul className="divide-y">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="flex-1">
                  <span className="block font-mono font-bold">{o.orderNumber}</span>
                  <span className="block text-xs text-muted-foreground">{o.studentName} · {canteens.find((c) => c.id === o.canteenId)?.name} · <TimeText iso={o.placedAt} /></span>
                </span>
                <span className="font-semibold">{formatPrice(o.total)}</span>
                <StatusBadge status={o.status} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Flagged reviews" action={<Button asChild size="sm" variant="ghost"><Link to="/admin/reviews">Moderate <ArrowRight /></Link></Button>}>
          {flagged.length === 0 ? (
            <p className="text-sm text-muted-foreground">No flagged reviews. 🎉</p>
          ) : (
            <ul className="space-y-3">
              {flagged.map((r) => (
                <li key={r.id} className="rounded-xl bg-muted p-3 text-sm">
                  <div className="flex justify-between"><b>{r.studentName}</b><Stars value={r.rating} /></div>
                  <p className="text-muted-foreground">{canteens.find((c) => c.id === r.canteenId)?.name}: {r.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
