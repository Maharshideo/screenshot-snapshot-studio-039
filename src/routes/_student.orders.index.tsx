import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Receipt, RotateCcw, Star } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";
import { formatPrice, isActive } from "@/lib/order-logic";
import { EmptyState, PageHeader, StatusBadge, TimeText } from "@/components/canteeno/bits";
import { StudentGate } from "@/components/canteeno/student-gate";
import { ReviewDialog } from "@/components/canteeno/review-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/_student/orders/")({
  head: () => ({
    meta: [
      { title: "My orders — Canteeno" },
      { name: "description", content: "Track active pickup orders and reorder past favourites." },
      { property: "og:title", content: "My orders — Canteeno" },
      { property: "og:description", content: "Track active pickup orders and reorder past favourites." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="container-app py-8">
      <PageHeader title="My orders" description="Active pickups and your order history." />
      <StudentGate title="Log in to see your orders">{(u) => <OrdersList userId={u.id} />}</StudentGate>
    </div>
  ),
});

function OrdersList({ userId }: { userId: string }) {
  const orders = useApp((s) => s.orders).filter((o) => o.userId === userId);
  const [tab, setTab] = useState<"active" | "past">(orders.some((o) => isActive(o.status)) ? "active" : "past");
  const list = orders.filter((o) => (tab === "active" ? isActive(o.status) : !isActive(o.status)));

  return (
    <>
      <Tabs value={tab} onValueChange={(v) => setTab(v as "active" | "past")} className="mb-5">
        <TabsList className="rounded-full">
          <TabsTrigger value="active" className="rounded-full">Active ({orders.filter((o) => isActive(o.status)).length})</TabsTrigger>
          <TabsTrigger value="past" className="rounded-full">Past ({orders.filter((o) => !isActive(o.status)).length})</TabsTrigger>
        </TabsList>
      </Tabs>
      {list.length === 0 ? (
        <EmptyState icon={<Receipt />} title={tab === "active" ? "No active orders" : "No past orders yet"} description="Hungry? Your next pickup is a few taps away." action={<Button asChild><Link to="/canteens">Order food</Link></Button>} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {list.map((o) => <OrderCard key={o.id} order={o} />)}
        </ul>
      )}
    </>
  );
}

function OrderCard({ order }: { order: Order }) {
  const canteen = useApp((s) => s.canteens.find((c) => c.id === order.canteenId));
  const reorder = useApp((s) => s.reorder);
  const navigate = useNavigate();
  return (
    <li className="rounded-3xl border bg-card p-4 shadow-soft transition-shadow hover:shadow-card">
      <Link to="/orders/$orderId" params={{ orderId: order.id }} className="flex items-start gap-3">
        <img src={canteen?.image} alt="" width={56} height={56} className="size-14 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display font-bold">{canteen?.name ?? "Canteen"}</p>
              <p className="font-mono text-xs text-muted-foreground">{order.orderNumber}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{order.items.map((l) => `${l.qty}× ${l.name}`).join(", ")}</p>
          <div className="mt-2 flex items-center justify-between text-sm">
            <TimeText iso={order.placedAt} mode="datetime" className="text-muted-foreground" />
            <span className="font-bold">{formatPrice(order.total)}</span>
          </div>
        </div>
        <ChevronRight className="mt-4 size-5 text-muted-foreground" />
      </Link>
      {!isActive(order.status) && (
        <div className="mt-3 flex gap-2 border-t pt-3">
          <Button
            size="sm"
            variant="soft"
            onClick={() => {
              const r = reorder(order.id);
              if (!r.added) return toast.error("None of these items are available right now.");
              toast.success("Items added to cart", { description: r.skipped ? `${r.skipped} unavailable item(s) skipped` : undefined });
              navigate({ to: "/cart" });
            }}
          >
            <RotateCcw /> Reorder
          </Button>
          {order.status === "collected" && !order.reviewed && (
            <ReviewDialog canteenId={order.canteenId} orderId={order.id} trigger={<Button size="sm" variant="outline"><Star /> Rate</Button>} />
          )}
        </div>
      )}
    </li>
  );
}
