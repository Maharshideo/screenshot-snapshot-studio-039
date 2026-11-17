import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Search, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";
import { formatPrice } from "@/lib/order-logic";
import { DashHeader, Panel } from "@/components/dashboard/dashboard-shell";
import { FoodFormDialog } from "@/components/dashboard/food-form";
import { CategoryManager } from "@/components/dashboard/category-manager";
import { useStaffCanteen } from "@/components/dashboard/use-staff";
import { EmptyState, VegMark } from "@/components/canteeno/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import type { FoodItem } from "@/lib/types";

export const Route = createFileRoute("/staff/menu")({
  component: StaffMenu,
});

function PriceCell({ food }: { food: FoodItem }) {
  const patchFood = useApp((s) => s.patchFood);
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(String(food.price));
  if (!editing)
    return (
      <button type="button" className="cursor-pointer rounded-lg px-2 py-1 font-semibold tabular-nums hover:bg-muted" onClick={() => { setV(String(food.price)); setEditing(true); }} aria-label={`Edit price of ${food.name}`}>
        {formatPrice(food.price)}
      </button>
    );
  const save = () => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 2000) { toast.error("Price must be ₹1–2000"); return; }
    patchFood(food.id, { price: n });
    toast.success(`${food.name}: ${formatPrice(n)}`);
    setEditing(false);
  };
  return (
    <Input autoFocus type="number" value={v} onChange={(e) => setV(e.target.value)} onBlur={save} onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }} className="h-8 w-24" aria-label="Price" />
  );
}

function StaffMenu() {
  const canteen = useStaffCanteen();
  const foods = useApp((s) => s.foods).filter((f) => f.canteenId === canteen.id);
  const categories = useApp((s) => s.categories);
  const { patchFood, deleteFood } = useApp.getState();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [stock, setStock] = useState("all");
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<FoodItem | null>(null);

  const list = foods.filter(
    (f) =>
      (cat === "all" || f.categoryId === cat) &&
      (stock === "all" || (stock === "out" ? !f.inStock : stock === "hidden" ? !f.available : f.inStock)) &&
      (!q.trim() || f.name.toLowerCase().includes(q.trim().toLowerCase())),
  );

  return (
    <>
      <DashHeader
        title="Menu & stock"
        description={`${foods.length} items · ${foods.filter((f) => !f.inStock).length} out of stock · ${foods.filter((f) => !f.available).length} hidden`}
        action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus /> Add food item</Button>}
      />
      <Tabs defaultValue="items">
        <TabsList className="mb-4 rounded-full">
          <TabsTrigger value="items" className="rounded-full">Food items</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-full">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <Panel>
            <div className="mb-4 flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search menu" className="pl-9" aria-label="Search menu" />
              </div>
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="md:w-48" aria-label="Filter category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.filter((c) => foods.some((f) => f.categoryId === c.id)).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stock} onValueChange={setStock}>
                <SelectTrigger className="md:w-40" aria-label="Filter stock"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All items</SelectItem>
                  <SelectItem value="in">In stock</SelectItem>
                  <SelectItem value="out">Out of stock</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {list.length === 0 ? (
              <EmptyState icon={<UtensilsCrossed />} title="No items" description="Adjust filters or add a new item." />
            ) : (
              <div className="-mx-5 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-5">Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Prep</TableHead>
                      <TableHead>In stock</TableHead>
                      <TableHead>Listed</TableHead>
                      <TableHead className="pr-5 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((f) => (
                      <TableRow key={f.id} className={!f.available ? "opacity-60" : undefined}>
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-3">
                            <img src={f.image} alt="" width={40} height={40} loading="lazy" className="size-10 rounded-lg object-cover" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5"><VegMark veg={f.isVeg} /><span className="font-semibold">{f.name}</span></div>
                              {f.popular && <span className="text-[11px] font-bold text-highlight">Bestseller</span>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{categories.find((c) => c.id === f.categoryId)?.name}</TableCell>
                        <TableCell><PriceCell food={f} /></TableCell>
                        <TableCell className="tabular-nums">{f.prepTime}m</TableCell>
                        <TableCell>
                          <Switch checked={f.inStock} onCheckedChange={(v) => { patchFood(f.id, { inStock: v }); toast.success(`${f.name} ${v ? "back in stock" : "marked out of stock"}`); }} aria-label={`${f.name} in stock`} />
                        </TableCell>
                        <TableCell>
                          <Switch checked={f.available} onCheckedChange={(v) => { patchFood(f.id, { available: v }); toast.success(`${f.name} ${v ? "listed" : "hidden from menu"}`); }} aria-label={`${f.name} listed on menu`} />
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          <Button size="icon-sm" variant="ghost" onClick={() => { setEditing(f); setFormOpen(true); }} aria-label={`Edit ${f.name}`}><Pencil /></Button>
                          <Button size="icon-sm" variant="ghost" onClick={() => setDeleting(f)} aria-label={`Delete ${f.name}`}><Trash2 className="text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Panel>
        </TabsContent>
        <TabsContent value="categories">
          <Panel><CategoryManager canteenId={canteen.id} /></Panel>
        </TabsContent>
      </Tabs>

      <FoodFormDialog open={formOpen} onOpenChange={setFormOpen} canteenId={canteen.id} food={editing} />
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>It will be removed from the menu and any student carts. Past orders keep their record.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleting) { deleteFood(deleting.id); toast.success(`${deleting.name} deleted`); } }}>
              Delete item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
