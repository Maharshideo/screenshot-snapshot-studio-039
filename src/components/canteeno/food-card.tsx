import { Link } from "@tanstack/react-router";
import { Clock, Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useApp, useCurrentStudent } from "@/store/app-store";
import { formatPrice } from "@/lib/order-logic";
import type { FoodItem } from "@/lib/types";
import { VegMark } from "./bits";
import { QtyStepper } from "./qty-stepper";
import { useAddToCart } from "./use-add-to-cart";

export function AddControl({ food, size = "md" }: { food: FoodItem; size?: "sm" | "md" }) {
  const qty = useApp((s) => s.cart.items.find((l) => l.foodId === food.id)?.qty ?? 0);
  const setQty = useApp((s) => s.setQty);
  const canteenOpen = useApp((s) => {
    const c = s.canteens.find((x) => x.id === food.canteenId);
    return !!c && c.isOpen && c.acceptingOrders;
  });
  const add = useAddToCart();

  if (!food.inStock)
    return (
      <Button size="sm" variant="outline" disabled className="text-xs">
        Out of stock
      </Button>
    );
  if (qty > 0) return <QtyStepper size="sm" value={qty} onChange={(v) => setQty(food.id, v)} label={food.name} />;
  return (
    <Button size="sm" variant={size === "sm" ? "soft" : "default"} disabled={!canteenOpen} onClick={() => add(food.id)} aria-label={`Add ${food.name} to cart`}>
      <Plus /> {canteenOpen ? "Add" : "Closed"}
    </Button>
  );
}

export function FavouriteButton({ foodId, className }: { foodId: string; className?: string }) {
  const user = useCurrentStudent();
  const toggle = useApp((s) => s.toggleFavouriteFood);
  const fav = !!user?.favouriteFoods.includes(foodId);
  return (
    <button
      type="button"
      aria-label={fav ? "Remove from favourites" : "Save to favourites"}
      aria-pressed={fav}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const r = toggle(foodId);
        if (r === null) toast("Log in to save favourites");
        else toast.success(r ? "Saved to favourites" : "Removed from favourites", { duration: 1500 });
      }}
      className={cn(
        "grid size-9 cursor-pointer place-items-center rounded-full bg-card/90 shadow-soft backdrop-blur transition-transform hover:scale-110",
        className,
      )}
    >
      <Heart className={cn("size-4", fav ? "fill-highlight text-highlight" : "text-foreground")} />
    </button>
  );
}

export function FoodCard({ food, showCanteen = false, layout = "grid" }: { food: FoodItem; showCanteen?: boolean; layout?: "grid" | "row" }) {
  const canteen = useApp((s) => s.canteens.find((c) => c.id === food.canteenId));

  if (layout === "row") {
    return (
      <article className={cn("flex gap-4 rounded-2xl border bg-card p-3 shadow-soft transition-shadow hover:shadow-card", !food.inStock && "opacity-75")}>
        <div className="min-w-0 flex-1 py-1">
          <div className="flex items-center gap-2">
            <VegMark veg={food.isVeg} />
            {food.popular && <span className="text-[11px] font-bold uppercase tracking-wide text-highlight">Bestseller</span>}
          </div>
          <h3 className="mt-1 font-display text-base font-bold leading-tight">{food.name}</h3>
          <p className="mt-0.5 font-semibold">{formatPrice(food.price)}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{food.description}</p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> ~{food.prepTime} min prep
          </p>
        </div>
        <div className="relative flex w-28 shrink-0 flex-col items-center sm:w-32">
          <img src={food.image} alt={food.name} loading="lazy" width={128} height={112} className={cn("h-24 w-full rounded-xl object-cover sm:h-28", !food.inStock && "grayscale")} />
          <FavouriteButton foodId={food.id} className="absolute right-1.5 top-1.5 size-7 [&_svg]:size-3.5" />
          <div className="-mt-4">
            <AddControl food={food} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft card-hover", !food.inStock && "opacity-80")}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={food.image}
          alt={food.name}
          loading="lazy"
          width={400}
          height={300}
          className={cn("size-full object-cover transition-transform duration-500 group-hover:scale-105", !food.inStock && "grayscale")}
        />
        <FavouriteButton foodId={food.id} className="absolute right-2.5 top-2.5" />
        {food.popular && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-highlight px-2.5 py-1 text-[11px] font-bold text-highlight-foreground shadow-glow">Bestseller</span>
        )}
        {!food.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-foreground/75 py-1.5 text-center text-xs font-bold text-background">Out of stock</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start gap-2">
          <VegMark veg={food.isVeg} className="mt-0.5" />
          <h3 className="line-clamp-2 font-display font-bold leading-tight">{food.name}</h3>
        </div>
        {showCanteen && canteen && (
          <Link to="/canteens/$canteenId" params={{ canteenId: canteen.id }} className="mt-1 text-xs font-medium text-primary hover:underline">
            {canteen.name}
          </Link>
        )}
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" /> ~{food.prepTime} min
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-lg font-bold">{formatPrice(food.price)}</span>
          <AddControl food={food} />
        </div>
      </div>
    </article>
  );
}
