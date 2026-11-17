import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useApp } from "@/store/app-store";
import { EmptyState, PageHeader } from "@/components/canteeno/bits";
import { StudentGate } from "@/components/canteeno/student-gate";
import { FoodCard } from "@/components/canteeno/food-card";
import { CanteenCard } from "@/components/canteeno/canteen-card";
import { Button } from "@/components/ui/button";
import type { Student } from "@/lib/types";

export const Route = createFileRoute("/_student/favourites")({
  head: () => ({
    meta: [
      { title: "Favourites — Canteeno" },
      { name: "description", content: "Your saved dishes and canteens for quick reordering." },
      { property: "og:title", content: "Favourites — Canteeno" },
      { property: "og:description", content: "Your saved dishes and canteens." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="container-app py-8">
      <PageHeader title="Favourites" description="Dishes and canteens you've saved." />
      <StudentGate title="Log in to see favourites">{(u) => <Favs user={u} />}</StudentGate>
    </div>
  ),
});

function Favs({ user }: { user: Student }) {
  const foods = useApp((s) => s.foods).filter((f) => user.favouriteFoods.includes(f.id) && f.available);
  const canteens = useApp((s) => s.canteens).filter((c) => user.favouriteCanteens.includes(c.id));
  if (!foods.length && !canteens.length)
    return <EmptyState icon={<Heart />} title="Nothing saved yet" description="Tap the heart on any dish or canteen to save it here." action={<Button asChild><Link to="/canteens">Explore canteens</Link></Button>} />;
  return (
    <div className="space-y-10">
      {canteens.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Canteens</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {canteens.map((c) => <CanteenCard key={c.id} canteen={c} />)}
          </div>
        </section>
      )}
      {foods.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Dishes</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {foods.map((f) => <FoodCard key={f.id} food={f} showCanteen />)}
          </div>
        </section>
      )}
    </div>
  );
}
