import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";
import { DashHeader, Panel } from "@/components/dashboard/dashboard-shell";
import { CanteenFormDialog } from "@/components/dashboard/canteen-form";
import { DemoBadge, Rating } from "@/components/canteeno/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Canteen } from "@/lib/types";

export const Route = createFileRoute("/admin/canteens")({
  component: AdminCanteens,
});

function AdminCanteens() {
  const canteens = useApp((s) => s.canteens);
  const foods = useApp((s) => s.foods);
  const orders = useApp((s) => s.orders);
  const { patchCanteen, deleteCanteen } = useApp.getState();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Canteen | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Canteen | null>(null);
  const list = canteens.filter((c) => !q.trim() || c.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <DashHeader title="Canteens" description={`${canteens.length} registered outlets`} action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus /> Add canteen</Button>} />
      <Panel>
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search canteens" className="pl-9" aria-label="Search canteens" />
        </div>
        <div className="-mx-5 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Canteen</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Menu</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Open</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <img src={c.image} alt="" width={48} height={36} loading="lazy" className="h-9 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold">{c.name} <span className="font-mono text-xs text-muted-foreground">{c.code}</span></p>
                        <p className="text-xs text-muted-foreground">{c.location}</p>
                      </div>
                      <DemoBadge className="hidden xl:inline-flex" />
                    </div>
                  </TableCell>
                  <TableCell><Rating value={c.rating} /></TableCell>
                  <TableCell className="tabular-nums">{foods.filter((f) => f.canteenId === c.id).length}</TableCell>
                  <TableCell className="tabular-nums">{orders.filter((o) => o.canteenId === c.id).length}</TableCell>
                  <TableCell><Switch checked={c.isOpen} onCheckedChange={(v) => { patchCanteen(c.id, { isOpen: v, acceptingOrders: v }); toast.success(`${c.name} ${v ? "opened" : "closed"}`); }} aria-label={`${c.name} open`} /></TableCell>
                  <TableCell><Switch checked={c.featured} onCheckedChange={(v) => { patchCanteen(c.id, { featured: v }); toast.success(`${c.name} ${v ? "featured" : "unfeatured"}`); }} aria-label={`${c.name} featured`} /></TableCell>
                  <TableCell className="pr-5 text-right whitespace-nowrap">
                    <Button asChild size="icon-sm" variant="ghost"><Link to="/canteens/$canteenId" params={{ canteenId: c.id }} aria-label={`View ${c.name}`}><ExternalLink /></Link></Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => { setEditing(c); setFormOpen(true); }} aria-label={`Edit ${c.name}`}><Pencil /></Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}><Trash2 className="text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
      <CanteenFormDialog open={formOpen} onOpenChange={setFormOpen} canteen={editing} />
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This deletes the canteen and its {foods.filter((f) => f.canteenId === deleting?.id).length} menu items from the demo. Past orders stay in history.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleting) { deleteCanteen(deleting.id); toast.success(`${deleting.name} removed`); } }}>Remove canteen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
