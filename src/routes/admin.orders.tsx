import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/store/app-store";
import { formatPrice, STATUS_LABEL } from "@/lib/order-logic";
import { DashHeader, Panel } from "@/components/dashboard/dashboard-shell";
import { OrderDrawer } from "@/components/dashboard/order-drawer";
import { StatusBadge, TimeText } from "@/components/canteeno/bits";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const orders = useApp((s) => s.orders);
  const canteens = useApp((s) => s.canteens);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [canteen, setCanteen] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const t = q.trim().toLowerCase();
  const list = [...orders]
    .filter((o) => (status === "all" || o.status === status) && (canteen === "all" || o.canteenId === canteen))
    .filter((o) => !t || o.orderNumber.toLowerCase().includes(t) || o.studentName.toLowerCase().includes(t))
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));

  return (
    <>
      <DashHeader title="Order monitoring" description="All pickup orders across canteens. Read-only — canteens manage their own orders." />
      <Panel>
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order # or student" className="pl-9" aria-label="Search orders" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="md:w-44" aria-label="Status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={canteen} onValueChange={setCanteen}>
            <SelectTrigger className="md:w-48" aria-label="Canteen"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All canteens</SelectItem>
              {canteens.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="-mx-5 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Order</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Canteen</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead className="pr-5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No orders match.</TableCell></TableRow>}
              {list.map((o) => (
                <TableRow key={o.id} className="cursor-pointer" onClick={() => setOpenId(o.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setOpenId(o.id)}>
                  <TableCell className="pl-5 font-mono font-semibold">{o.orderNumber}</TableCell>
                  <TableCell>{o.studentName}</TableCell>
                  <TableCell>{canteens.find((c) => c.id === o.canteenId)?.name ?? "Removed"}</TableCell>
                  <TableCell className="tabular-nums">{o.items.reduce((n, l) => n + l.qty, 0)}</TableCell>
                  <TableCell className="tabular-nums">{formatPrice(o.total)}</TableCell>
                  <TableCell><TimeText iso={o.placedAt} mode="datetime" className="text-sm" /></TableCell>
                  <TableCell className="pr-5"><StatusBadge status={o.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
      <OrderDrawer orderId={openId} onOpenChange={(o) => !o && setOpenId(null)} readOnly />
    </>
  );
}
