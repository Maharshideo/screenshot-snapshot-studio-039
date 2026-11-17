import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { CATEGORY_ICONS, CategoryIcon } from "@/components/canteeno/category-icon";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

/** Shared category CRUD used by staff (menu page) and admin. Categories are global. */
export function CategoryManager({ canteenId }: { canteenId?: string }) {
  const categories = useApp((s) => s.categories);
  const foods = useApp((s) => s.foods);
  const { upsertCategory, deleteCategory } = useApp.getState();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("utensils-crossed");
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const openEditor = (c: Category | "new") => {
    setEditing(c);
    setName(c === "new" ? "" : c.name);
    setIcon(c === "new" ? "utensils-crossed" : c.icon);
    setErr(null);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Categories are shared across all canteens. Hide one to remove it from student menus.</p>
        <Button size="sm" onClick={() => openEditor("new")}><Plus /> New category</Button>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => {
          const count = foods.filter((f) => f.categoryId === c.id && (!canteenId || f.canteenId === canteenId)).length;
          return (
            <li key={c.id} className={cn("flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-soft", !c.active && "opacity-60")}>
              <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary"><CategoryIcon icon={c.icon} className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{count} items{canteenId ? " here" : ""}</p>
              </div>
              <Switch checked={c.active} onCheckedChange={(v) => { upsertCategory({ ...c, active: v }); toast.success(`${c.name} ${v ? "shown" : "hidden"}`); }} aria-label={`Show ${c.name}`} />
              <Button size="icon-sm" variant="ghost" onClick={() => openEditor(c)} aria-label={`Edit ${c.name}`}><Pencil /></Button>
              <Button size="icon-sm" variant="ghost" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}><Trash2 className="text-destructive" /></Button>
            </li>
          );
        })}
      </ul>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "New category" : "Edit category"}</DialogTitle>
            <DialogDescription>Choose a name and an icon.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const n = name.trim();
              if (n.length < 2) return void setErr("Name must be at least 2 characters");
              if (categories.some((c) => c.name.toLowerCase() === n.toLowerCase() && (editing === "new" || c.id !== editing?.id))) return void setErr("A category with this name exists");
              upsertCategory(editing === "new" || !editing ? { name: n, icon, active: true } : { ...editing, name: n, icon });
              toast.success(editing === "new" ? `${n} added` : `${n} updated`);
              setEditing(null);
            }}
          >
            <div>
              <Label htmlFor="cat-name">Name</Label>
              <Input id="cat-name" value={name} onChange={(e) => { setName(e.target.value); setErr(null); }} className="mt-1" maxLength={30} aria-invalid={!!err} />
              {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
            </div>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
              {Object.keys(CATEGORY_ICONS).map((k) => (
                <button key={k} type="button" onClick={() => setIcon(k)} aria-label={k} aria-pressed={icon === k} className={cn("grid aspect-square cursor-pointer place-items-center rounded-xl border", icon === k ? "border-primary bg-secondary text-primary" : "hover:bg-muted")}>
                  <CategoryIcon icon={k} className="size-5" />
                </button>
              ))}
            </div>
            <DialogFooter><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>Only empty categories can be deleted. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleting) return;
                const r = deleteCategory(deleting.id);
                if (r.ok) toast.success(`${deleting.name} deleted`);
                else toast.error(r.error);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
