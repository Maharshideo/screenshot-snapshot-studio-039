import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Clock, Heart, MapPin, Phone, Search, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { useApp, useCurrentStudent, useHydrated } from "@/store/app-store";
import { seedCanteens } from "@/data/seed";
import { FoodCard } from "@/components/canteeno/food-card";
import { OpenStatus } from "@/components/canteeno/canteen-card";
import { CategoryToggleChips } from "@/components/canteeno/category-chips";
import { DemoBadge, DemoNotice, EmptyState, Rating, Stars, TimeText } from "@/components/canteeno/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { cartSubtotal, formatPrice } from "@/lib/order-logic";

export const Route = createFileRoute("/_student/canteens/$canteenId")({
  loader: ({ params }) => {
    // Seed lookup only for metadata; admin-created canteens resolve from local state in the component.
    const c = seedCanteens.find((x) => x.id === params.canteenId);
    return { name: c?.name ?? null, tagline: c?.tagline ?? null };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.name ? `${loaderData.name} menu — Canteeno` : "Canteen menu — Canteeno";
    const desc = loaderData?.tagline ? `${loaderData.tagline}. Order ahead and pick up on campus.` : "Browse the menu and order ahead for pickup.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: CanteenPage,
  notFoundComponent: () => (
    <div className="container-app py-16">
      <EmptyState icon={<UtensilsCrossed />} title="Canteen not found" description="It may have been removed." action={<Button asChild><Link to="/canteens">All canteens</Link></Button>} />
    </div>
  ),
});

function CanteenPage() {
  const { canteenId } = Route.useParams();
  const hydrated = useHydrated();
  const canteen = useApp((s) => s.canteens.find((c) => c.id === canteenId));
  const allFoods = useApp((s) => s.foods);
  const reviewsAll = useApp((s) => s.reviews);
  const cart = useApp((s) => s.cart);
  const user = useCurrentStudent();
  const toggleFav = useApp((s) => s.toggleFavouriteCanteen);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [vegOnly, setVegOnly] = useState(false);

  const foods = useMemo(() => allFoods.filter((f) => f.canteenId === canteenId && f.available), [allFoods, canteenId]);
  const catIds = useMemo(() => [...new Set(foods.map((f) => f.categoryId))], [foods]);
  const categories = useApp((s) => s.categories);
  const filtered = foods.filter(
    (f) => (!cat || f.categoryId === cat) && (!vegOnly || f.isVeg) && (!q.trim() || f.name.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const grouped = catIds
    .map((id) => ({ cat: categories.find((c) => c.id === id), items: filtered.filter((f) => f.categoryId === id) }))
    .filter((g) => g.items.length && g.cat?.active !== false);
  const reviews = reviewsAll.filter((r) => r.canteenId === canteenId && r.status === "published").slice(0, 4);

  if (!canteen) {
    if (!hydrated) return <div className="container-app py-16"><div className="h-72 animate-pulse rounded-3xl bg-muted" /></div>;
    throw notFound();
  }

  const fav = !!user?.favouriteCanteens.includes(canteen.id);
  const cartHere = cart.canteenId === canteen.id && cart.items.length > 0;
  const cartCount = cart.items.reduce((n, l) => n + l.qty, 0);
  const today = canteen.openingHours[(new Date().getDay() + 6) % 7];

  return (
    <div>
      {/* Cover */}
      <div className="container-app pt-4">
        <div className="relative h-56 overflow-hidden rounded-[2rem] sm:h-72">
          <img src={canteen.image} alt={canteen.name} width={1200} height={800} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
          <Button asChild variant="hero-outline" size="sm" className="absolute left-4 top-4">
            <Link to="/canteens"><ArrowLeft /> All canteens</Link>
          </Button>
          <button
            type="button"
            aria-pressed={fav}
            aria-label={fav ? "Remove canteen from favourites" : "Save canteen to favourites"}
            onClick={() => {
              const r = toggleFav(canteen.id);
              if (r === null) toast("Log in to save favourites");
              else toast.success(r ? `${canteen.name} saved` : "Removed from favourites");
            }}
            className="absolute right-4 top-4 grid size-10 cursor-pointer place-items-center rounded-full bg-card/90 shadow-soft transition-transform hover:scale-110"
          >
            <Heart className={cn("size-5", fav ? "fill-highlight text-highlight" : "")} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-5 text-background sm:p-7">
            <div className="mb-2 flex flex-wrap gap-2">
              <OpenStatus canteen={canteen} className="bg-card" />
              <DemoBadge className="bg-card">Demo outlet</DemoBadge>
            </div>
            <h1 className="text-3xl font-extrabold sm:text-5xl">{canteen.name}</h1>
            <p className="mt-1 text-sm opacity-90 sm:text-base">{canteen.tagline}</p>
          </div>
        </div>
      </div>

      <div className="container-app mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Rating value={canteen.rating} count={canteen.ratingCount} />
            <span className="inline-flex items-center gap-1"><Clock className="size-4" /> ~{canteen.prepTime} min avg prep</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-4" /> {canteen.location}</span>
          </div>
          <p className="mt-3 max-w-2xl text-muted-foreground">{canteen.description}</p>

          {!(canteen.isOpen && canteen.acceptingOrders) && (
            <div className="mt-4 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm font-medium text-warning">
              {canteen.name} isn&apos;t taking orders right now. You can still browse the menu.
            </div>
          )}

          {/* Menu controls */}
          <div className="sticky top-16 z-20 -mx-4 mt-6 space-y-3 bg-background/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:px-0">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${canteen.name} menu`} className="pl-9" aria-label="Search this menu" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border bg-card px-3">
                <Switch id="veg-only" checked={vegOnly} onCheckedChange={setVegOnly} />
                <Label htmlFor="veg-only" className="whitespace-nowrap text-sm">Veg</Label>
              </div>
            </div>
            <CategoryToggleChips value={cat} onChange={setCat} ids={catIds} />
          </div>

          {grouped.length === 0 ? (
            <EmptyState className="mt-4" icon={<Search />} title="No dishes match" description="Try another search or category." action={<Button variant="outline" onClick={() => { setQ(""); setCat(null); setVegOnly(false); }}>Reset filters</Button>} />
          ) : (
            <div className="mt-4 space-y-10">
              {grouped.map((g) => (
                <section key={g.cat?.id} aria-labelledby={`cat-${g.cat?.id}`}>
                  <h2 id={`cat-${g.cat?.id}`} className="mb-4 text-xl font-bold">
                    {g.cat?.name} <span className="text-base font-medium text-muted-foreground">({g.items.length})</span>
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {g.items.map((f) => (
                      <FoodCard key={f.id} food={f} layout="row" />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Side info */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {hydrated && cartHere && (
            <div className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-lift">
              <p className="text-sm opacity-80">Your pickup order</p>
              <p className="mt-1 font-display text-2xl font-bold">{cartCount} items · {formatPrice(cartSubtotal(cart, allFoods))}</p>
              <Button asChild variant="highlight" className="mt-4 w-full">
                <Link to="/cart"><ShoppingBag /> View cart</Link>
              </Button>
            </div>
          )}
          <div className="rounded-3xl border bg-card p-5 shadow-soft">
            <h3 className="font-bold">Opening hours</h3>
            <p className="mb-3 text-xs text-muted-foreground">Placeholder timings — to be confirmed by the canteen.</p>
            <ul className="space-y-1.5 text-sm">
              {canteen.openingHours.map((h) => (
                <li key={h.day} className={cn("flex justify-between", hydrated && today?.day === h.day && "font-bold text-primary")}>
                  <span>{h.day}</span>
                  <span>{h.closed ? "Closed" : `${h.open} – ${h.close}`}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground"><Phone className="size-4" /> {canteen.phone} (demo)</p>
          </div>
          <div className="rounded-3xl border bg-card p-5 shadow-soft">
            <h3 className="mb-3 font-bold">What students say</h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{r.studentName}</span>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-1 text-muted-foreground">{r.comment}</p>
                    <TimeText iso={r.at} className="text-xs text-muted-foreground" />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DemoNotice>Menu items, prices and ratings are sample data for this prototype.</DemoNotice>
        </aside>
      </div>
    </div>
  );
}
