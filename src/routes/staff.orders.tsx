import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import { useApp } from "@/store/app-store";
import { DashHeader } from "@/components/dashboard/dashboard-shell";
import { StaffOrderCard } from "@/components/dashboard/order-card";
import { OrderDrawer } from "@/components/dashboard/order-drawer";
import { useStaffCanteen } from "@/components/dashboard/use-staff";
import { EmptyState } from "@/components/canteeno/bits";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import type { OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/staff/orders")({
  component: StaffOrders,
});

const TABS: { id: string; label: string; statuses: OrderStatus[] }[] = [
  { id: "pending", label: "Pending", statuses: ["placed"] },
  { id: "accepted", label: "Accepted", statuses: ["accepted"] },
  { id: "preparing", label: "Preparing", statuses: ["preparing"] },
  { id: "ready", label: "Ready", statuses: ["ready"] },
  { id: "completed", label: "Completed", statuses: ["collected"] },
  { id: "closed", label: "Rejected / cancelled", statuses: ["rejected", "cancelled"] },
];

function StaffOrders() {
  const canteen = useStaffCanteen();
  const orders = useApp((s) => s.orders).filter((o) => o.canteenId === canteen.id);
  const [tab, setTab] = useState("pending");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const current = TABS.find((t) => t.id === tab)!;
  const term = q.trim().toLowerCase();
  const list = orders
    .filter((o) => current.statuses.includes(o.status))
    .filter((o) => !term || o.orderNumber.toLowerCase().includes(term) || o.studentName.toLowerCase().includes(term))
    .sort((a, b) => (tab === "completed" || tab === "closed" ? b.placedAt.localeCompare(a.placedAt) : a.placedAt.localeCompare(b.placedAt)));

  return (
    <>
      <DashHeader title="Orders" description="Move each order through Accepted → Preparing → Ready → Collected." />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto flex-wrap justify-start rounded-2xl">
            {TABS.map((t) => {
              const n = orders.filter((o) => t.statuses.includes(o.status)).length;
              return (
                <TabsTrigger key={t.id} value={t.id} className="rounded-xl">
                  {t.label} <span className="ml-1 rounded-full bg-muted px-1.5 text-xs">{n}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order # or student" className="pl-9" aria-label="Search orders" />
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<ClipboardList />} title={`No ${current.label.toLowerCase()} orders`} description={term ? "Try another search." : "Orders will show up here as they arrive."} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((o) => <StaffOrderCard key={o.id} order={o} onOpen={() => setOpenId(o.id)} />)}
        </div>
      )}
      <OrderDrawer orderId={openId} onOpenChange={(o) => !o && setOpenId(null)} />
    </>
  );
}
