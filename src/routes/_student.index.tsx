import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, BellRing, Clock, Coffee, Moon, ShoppingBag, Sparkles, Store, TimerReset, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useApp, useCurrentStudent } from "@/store/app-store";
import { images } from "@/data/images";
import { CanteenCard } from "@/components/canteeno/canteen-card";
import { FoodCard } from "@/components/canteeno/food-card";
import { CategoryRail } from "@/components/canteeno/category-chips";
import { DemoBadge, SectionHeading } from "@/components/canteeno/bits";
import { SearchBox } from "@/components/canteeno/site-header";

export const Route = createFileRoute("/_student/")({
  head: () => ({
    meta: [
      { title: "Canteeno — Skip the canteen queue on campus" },
      { name: "description", content: "Browse every campus canteen, order Maggi, coffee, thalis and snacks ahead, and pick up when your food is ready." },
      { property: "og:title", content: "Canteeno — Skip the canteen queue on campus" },
      { property: "og:description", content: "Order ahead from campus canteens and pick up when it's ready." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const offers = [
  { title: "Free chai with any breakfast", sub: "Annapurna · 7:30–10 AM", icon: Coffee, to: "annapurna", tone: "bg-highlight-soft text-highlight" },
  { title: "Midnight Maggi combo ₹60", sub: "Hostel canteens · after 10 PM", icon: Moon, to: "hostel-a", tone: "bg-secondary text-primary" },
  { title: "Biryani Wednesdays — 10% off", sub: "Amba · lunch & dinner", icon: Utensils, to: "amba", tone: "bg-warning-soft text-warning" },
];

function Home() {
  const canteens = useApp((s) => s.canteens);
  const foods = useApp((s) => s.foods);
  const user = useCurrentStudent();
  const [openOnly, setOpenOnly] = useState(false);

  const visibleFoods = useMemo(() => {
    const openIds = new Set(canteens.filter((c) => c.isOpen).map((c) => c.id));
    return foods.filter((f) => f.available && openIds.has(f.canteenId));
  }, [foods, canteens]);
  const popular = visibleFoods.filter((f) => f.popular && f.inStock).slice(0, 8);
  const recommended = visibleFoods.filter((f) => f.recommended && f.inStock && !f.popular).slice(0, 4);
  const featured = canteens.filter((c) => c.featured);
  const listed = openOnly ? canteens.filter((c) => c.isOpen && c.acceptingOrders) : canteens;
  const openCount = canteens.filter((c) => c.isOpen).length;

  return (
    <>
      {/* Hero */}
      <section className="container-app pt-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-hero text-primary-foreground shadow-lift">
          <div className="grid items-center lg:grid-cols-[1.05fr_1fr]">
            <div className="relative z-10 p-7 sm:p-10 lg:p-14">
              <DemoBadge className="mb-5 border-highlight/60 bg-primary-foreground/10 text-primary-foreground">Campus prototype</DemoBadge>
              <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
                Skip the queue.
                <br />
                <span className="text-highlight">Grab it hot.</span>
              </h1>
              <p className="mt-4 max-w-md text-base text-primary-foreground/80 sm:text-lg">
                Order from any campus canteen between classes and pick it up the moment it&apos;s ready.
              </p>
              <div className="mt-6 max-w-md">
                <SearchBox />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="highlight" size="lg">
                  <Link to="/canteens">
                    Browse canteens <ArrowRight />
                  </Link>
                </Button>
                {!user && (
                  <Button asChild variant="hero-outline" size="lg">
                    <Link to="/login">Log in</Link>
                  </Button>
                )}
              </div>
              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                <div className="flex items-center gap-2"><Store className="size-4 text-highlight" /><dt className="sr-only">Canteens</dt><dd><b>{canteens.length}</b> demo outlets</dd></div>
                <div className="flex items-center gap-2"><Clock className="size-4 text-highlight" /><dt className="sr-only">Open</dt><dd><b>{openCount}</b> open now</dd></div>
                <div className="flex items-center gap-2"><ShoppingBag className="size-4 text-highlight" /><dt className="sr-only">Mode</dt><dd>Self-pickup only</dd></div>
              </dl>
            </div>
            <div className="relative h-64 sm:h-80 lg:h-full lg:min-h-[520px]">
              <img src={images.hero} alt="Dosa, chai, vada pav, Maggi, samosas and cold coffee from campus canteens" width={1600} height={1008} className="absolute inset-0 size-full object-cover lg:rounded-l-[2rem]" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-primary-deep/60" />
              <div className="absolute bottom-5 left-5 flex animate-fade-up items-center gap-3 rounded-2xl bg-card/95 p-3 pr-5 text-foreground shadow-lift backdrop-blur">
                <span className="grid size-10 place-items-center rounded-xl bg-highlight text-highlight-foreground"><BellRing className="size-5" /></span>
                <span>
                  <span className="block text-sm font-bold">Order ready for pickup</span>
                  <span className="block text-xs text-muted-foreground">Nescafe counter · CN-NC-4821</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-app mt-12">
        <SectionHeading eyebrow="What are you craving?" title="Browse by category" />
        <CategoryRail />
      </section>

      {/* Offers */}
      <section className="container-app mt-12">
        <div className="grid gap-4 md:grid-cols-3">
          {offers.map((o) => (
            <Link key={o.title} to="/canteens/$canteenId" params={{ canteenId: o.to }} className="group flex items-center gap-4 rounded-3xl border bg-card p-5 shadow-soft card-hover">
              <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${o.tone}`}>
                <o.icon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <DemoBadge>Demo offer</DemoBadge>
                <span className="mt-1.5 block font-display font-bold leading-tight">{o.title}</span>
                <span className="block text-xs text-muted-foreground">{o.sub}</span>
              </span>
              <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured canteens */}
      <section className="container-app mt-14">
        <SectionHeading
          eyebrow="Campus favourites"
          title="Featured canteens"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/canteens">View all <ArrowRight /></Link>
            </Button>
          }
        />
        <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
          {featured.map((c) => (
            <CanteenCard key={c.id} canteen={c} className="w-72 shrink-0 snap-start sm:w-80" />
          ))}
        </div>
      </section>

      {/* Popular */}
      <section className="container-app mt-14">
        <SectionHeading eyebrow="Trending today" title="Popular on campus" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {popular.map((f) => (
            <FoodCard key={f.id} food={f} showCanteen />
          ))}
        </div>
      </section>

      {/* Recommended */}
      {recommended.length > 0 && (
        <section className="container-app mt-14">
          <div className="rounded-[2rem] bg-cream p-5 sm:p-8">
            <SectionHeading eyebrow={user ? `Picked for ${user.name.split(" ")[0]}` : "Recommended"} title="You might like" action={<Sparkles className="size-6 text-highlight" />} />
            <div className="grid gap-3 md:grid-cols-2">
              {recommended.map((f) => (
                <FoodCard key={f.id} food={f} layout="row" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All canteens */}
      <section className="container-app mt-14">
        <SectionHeading
          eyebrow="Every outlet"
          title="All canteens"
          action={
            <div className="flex items-center gap-2">
              <Switch id="open-only" checked={openOnly} onCheckedChange={setOpenOnly} />
              <Label htmlFor="open-only" className="text-sm">Open now</Label>
            </div>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listed.map((c) => (
            <CanteenCard key={c.id} canteen={c} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-app mt-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: ShoppingBag, title: "Order ahead", text: "Pick a canteen, add your food, and place a pickup order in seconds." },
            { icon: TimerReset, title: "Track preparation", text: "See when the canteen accepts, starts cooking and marks it ready." },
            { icon: BellRing, title: "Pick up & go", text: "Show your pickup code at the counter. No queue, no waiting around." },
          ].map((s, i) => (
            <div key={s.title} className="rounded-3xl border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground"><s.icon className="size-5" /></span>
                <span className="font-display text-sm font-bold text-highlight">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
