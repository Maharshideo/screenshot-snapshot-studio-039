import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/store/app-store";
import { fallbackFoodImage, imageForCategory, images } from "@/data/images";
import { cn } from "@/lib/utils";
import type { FoodItem } from "@/lib/types";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(60),
  description: z.string().trim().max(160).default(""),
  price: z.coerce.number({ invalid_type_error: "Enter a price" }).int("Whole rupees only").min(1, "Min ₹1").max(2000, "Max ₹2000"),
  prepTime: z.coerce.number({ invalid_type_error: "Enter minutes" }).int().min(1, "Min 1 min").max(90, "Max 90 min"),
  categoryId: z.string().min(1, "Choose a category"),
  isVeg: z.boolean(),
  inStock: z.boolean(),
  available: z.boolean(),
  popular: z.boolean(),
  image: z.string().min(1),
});
type Values = z.input<typeof schema>;

const gallery = Object.values(images.food);

export function FoodFormDialog({ open, onOpenChange, canteenId, food }: { open: boolean; onOpenChange: (o: boolean) => void; canteenId: string; food: FoodItem | null }) {
  const categories = useApp((s) => s.categories);
  const upsert = useApp((s) => s.upsertFood);
  const [imageTouched, setImageTouched] = useState(false);
  const blank: Values = { name: "", description: "", price: "" as unknown as number, prepTime: 5, categoryId: "", isVeg: true, inStock: true, available: true, popular: false, image: fallbackFoodImage };
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: blank });
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = form;

  useEffect(() => {
    if (!open) return;
    setImageTouched(!!food);
    reset(food ? { name: food.name, description: food.description, price: food.price, prepTime: food.prepTime, categoryId: food.categoryId, isVeg: food.isVeg, inStock: food.inStock, available: food.available, popular: !!food.popular, image: food.image } : blank);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, food]);

  const cat = watch("categoryId");
  const image = watch("image");
  useEffect(() => {
    const img = cat ? imageForCategory(cat) : undefined;
    if (!imageTouched && img) setValue("image", img);
  }, [cat, imageTouched, setValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{food ? "Edit food item" : "Add food item"}</DialogTitle>
          <DialogDescription>Shown on the student menu right away (in this browser).</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="space-y-4"
          onSubmit={handleSubmit((raw) => {
            const v = schema.parse(raw);
            upsert({ ...v, id: food?.id, canteenId, rating: food?.rating ?? 4.2, recommended: food?.recommended ?? false });
            toast.success(food ? `${v.name} updated` : `${v.name} added to menu`);
            onOpenChange(false);
          })}
        >
          <div>
            <Label htmlFor="f-name">Name</Label>
            <Input id="f-name" className="mt-1" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="f-desc">Description</Label>
            <Textarea id="f-desc" className="mt-1" maxLength={160} {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="f-price">Price (₹)</Label>
              <Input id="f-price" type="number" inputMode="numeric" className="mt-1" aria-invalid={!!errors.price} {...register("price")} />
              {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div>
              <Label htmlFor="f-prep">Prep time (min)</Label>
              <Input id="f-prep" type="number" inputMode="numeric" className="mt-1" aria-invalid={!!errors.prepTime} {...register("prepTime")} />
              {errors.prepTime && <p className="mt-1 text-xs text-destructive">{errors.prepTime.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="f-cat">Category</Label>
            <Select value={cat} onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}>
              <SelectTrigger id="f-cat" className="mt-1" aria-invalid={!!errors.categoryId}><SelectValue placeholder="Choose a category" /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{!c.active && " (hidden)"}</SelectItem>)}</SelectContent>
            </Select>
            {errors.categoryId && <p className="mt-1 text-xs text-destructive">{errors.categoryId.message}</p>}
          </div>
          <div>
            <Label>Photo</Label>
            <div className="mt-1 grid grid-cols-6 gap-2">
              {gallery.map((src) => (
                <button key={src} type="button" onClick={() => { setValue("image", src); setImageTouched(true); }} className={cn("aspect-square cursor-pointer overflow-hidden rounded-xl border-2 transition", image === src ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100")} aria-label="Choose photo" aria-pressed={image === src}>
                  <img src={src} alt="" className="size-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Photo uploads arrive with the backend; pick a stock photo for now.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted p-3">
            {([
              ["isVeg", "Vegetarian"],
              ["inStock", "In stock"],
              ["available", "Listed on menu"],
              ["popular", "Bestseller tag"],
            ] as const).map(([k, l]) => (
              <label key={k} className="flex items-center justify-between gap-2 text-sm font-medium">
                {l}
                <Switch checked={!!watch(k)} onCheckedChange={(v) => setValue(k, v)} />
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{food ? "Save changes" : "Add item"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
