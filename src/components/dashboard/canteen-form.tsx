import { useEffect } from "react";
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
import { useApp } from "@/store/app-store";
import { images } from "@/data/images";
import { cn } from "@/lib/utils";
import type { Canteen, OpeningHour } from "@/lib/types";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(40),
  code: z.string().trim().toUpperCase().regex(/^[A-Z]{2,3}$/, "2–3 letters, e.g. NC"),
  tagline: z.string().trim().min(3, "Add a tagline").max(60),
  description: z.string().trim().max(300).default(""),
  cuisine: z.string().trim().min(2, "Add at least one cuisine"),
  location: z.string().trim().min(3, "Add a location").max(60),
  phone: z.string().trim().regex(/^[+\d\s-]{10,16}$/, "Enter a valid phone"),
  prepTime: z.coerce.number().int().min(2, "Min 2").max(60, "Max 60"),
  isOpen: z.boolean(),
  featured: z.boolean(),
  image: z.string().min(1),
});
type Values = z.input<typeof schema>;

const defaultHours: OpeningHour[] = (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const).map((day) => ({ day, open: "09:00", close: "21:00", closed: false }));

export function CanteenFormDialog({ open, onOpenChange, canteen }: { open: boolean; onOpenChange: (o: boolean) => void; canteen: Canteen | null }) {
  const upsert = useApp((s) => s.upsertCanteen);
  const canteens = useApp((s) => s.canteens);
  const { register, handleSubmit, reset, setValue, watch, setError, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;
    reset(
      canteen
        ? { name: canteen.name, code: canteen.code, tagline: canteen.tagline, description: canteen.description, cuisine: canteen.cuisine.join(", "), location: canteen.location, phone: canteen.phone, prepTime: canteen.prepTime, isOpen: canteen.isOpen, featured: canteen.featured, image: canteen.image }
        : { name: "", code: "", tagline: "", description: "", cuisine: "", location: "", phone: "", prepTime: 10, isOpen: true, featured: false, image: images.canteens[0] },
    );
  }, [open, canteen, reset]);

  const image = watch("image");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{canteen ? `Edit ${canteen.name}` : "Add canteen"}</DialogTitle>
          <DialogDescription>New canteens are listed as demo outlets.</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="space-y-4"
          onSubmit={handleSubmit((raw) => {
            const v = schema.parse(raw);
            if (canteens.some((c) => c.code === v.code && c.id !== canteen?.id)) return setError("code", { message: "Code already used" });
            const saved = upsert({
              id: canteen?.id,
              name: v.name,
              code: v.code,
              tagline: v.tagline,
              description: v.description,
              cuisine: v.cuisine.split(",").map((s) => s.trim()).filter(Boolean),
              location: v.location,
              phone: v.phone,
              prepTime: v.prepTime,
              isOpen: v.isOpen,
              acceptingOrders: v.isOpen && (canteen?.acceptingOrders ?? true),
              featured: v.featured,
              image: v.image,
              rating: canteen?.rating ?? 4.0,
              ratingCount: canteen?.ratingCount ?? 0,
              openingHours: canteen?.openingHours ?? defaultHours,
            });
            toast.success(canteen ? `${saved.name} updated` : `${saved.name} added`);
            onOpenChange(false);
          })}
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <div>
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" className="mt-1" aria-invalid={!!errors.name} {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="c-code">Code</Label>
              <Input id="c-code" className="mt-1 uppercase" maxLength={3} aria-invalid={!!errors.code} {...register("code")} />
              {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code.message}</p>}
            </div>
          </div>
          {([
            ["tagline", "Tagline"],
            ["cuisine", "Cuisine (comma separated)"],
            ["location", "Location"],
            ["phone", "Phone"],
          ] as const).map(([k, l]) => (
            <div key={k}>
              <Label htmlFor={`c-${k}`}>{l}</Label>
              <Input id={`c-${k}`} className="mt-1" aria-invalid={!!errors[k]} {...register(k)} />
              {errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]?.message}</p>}
            </div>
          ))}
          <div>
            <Label htmlFor="c-desc">Description</Label>
            <Textarea id="c-desc" className="mt-1" maxLength={300} {...register("description")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="c-prep">Avg prep (min)</Label>
              <Input id="c-prep" type="number" className="mt-1" aria-invalid={!!errors.prepTime} {...register("prepTime")} />
              {errors.prepTime && <p className="mt-1 text-xs text-destructive">{errors.prepTime.message}</p>}
            </div>
            <label className="flex items-center justify-between gap-2 self-end rounded-xl border px-3 py-2.5 text-sm font-medium">Open <Switch checked={!!watch("isOpen")} onCheckedChange={(v) => setValue("isOpen", v)} /></label>
            <label className="flex items-center justify-between gap-2 self-end rounded-xl border px-3 py-2.5 text-sm font-medium">Featured <Switch checked={!!watch("featured")} onCheckedChange={(v) => setValue("featured", v)} /></label>
          </div>
          <div>
            <Label>Cover photo</Label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {images.canteens.map((src) => (
                <button key={src} type="button" onClick={() => setValue("image", src)} aria-pressed={image === src} aria-label="Choose cover" className={cn("aspect-video cursor-pointer overflow-hidden rounded-xl border-2", image === src ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100")}>
                  <img src={src} alt="" className="size-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{canteen ? "Save changes" : "Add canteen"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
