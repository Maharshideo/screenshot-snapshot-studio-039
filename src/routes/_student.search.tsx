import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { useApp } from "@/store/app-store";
import { CanteenCard } from "@/components/canteeno/canteen-card";
import { FoodCard } from "@/components/canteeno/food-card";
import { CategoryToggleChips } from "@/components/canteeno/category-chips";
import { EmptyState, PageHeader } from "@/components/canteeno/bits";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type SearchParams = { q?: string; cat?: string };

export const Route = createFileRoute("/_student/search")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    cat: typeof s.cat === "string" && s.cat ? s.cat : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search food & canteens — Canteeno" },
      { name: "description", content: "Search Maggi, coffee, thalis, snacks and every campus canteen on Canteeno." },
      { property: "og:title", content: "Search food & canteens — Canteeno" },
      { property: "og:description", content: "Find food across every campus canteen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});

type Sort = "relevance" | "price-asc" | "price-desc" | "prep";

function SearchPage() {
  const { q = "", cat } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const canteens = useApp((s) => s.canteens);
  const foods = useApp((s) => s.foods);
  const categories = useApp((s) => s.categories);
  const [vegOnly, setVegOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("relevance");

  const term = q.trim().toLowerCase();
  const catName = categories.find((c) => c.id === cat)?.name;

  const matchedCanteens = useMemo(
    () =>
      term
        ? canteens.filter((c) => [c.name, c.location, ...c.cuisine].join(" ").toLowerCase().includes(term))
        : [],
    [canteens, term],
  );

  const matchedFoods = useMemo(() => {
    const canteenById = new Map(canteens.map((c) => [c.id, c]));
    const list = foods.filter((f) => {
      if (!f.available) return false;
      if (cat && f.categoryId !== cat) return false;
      if (vegOnly && !f.isVeg) return false;
      if (inStockOnly && !f.inStock) return false;
      if (!term) return true;
      const c = canteenById.get(f.canteenId);
      return [f.name, f.description, c?.name ?? "", categories.find((x) => x.id === f.categoryId)?.name ?? ""].join(" ").toLowerCase().includes(term);
    });
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "prep") sorted.sort((a, b) => a.prepTime - b.prepTime);
    else sorted.sort((a, b) => Number(b.inStock) - Number(a.inStock) || Number(!!b.popular) - Number(!!a.popular));
    return sorted;
  }, [foods, canteens, categories, term, cat, vegOnly, inStockOnly, sort]);

  const title = term ? `Results for “${q}”` : catName ? catName : "Explore all food";
  const shown = matchedFoods.slice(0, 60);

  return (
    <div className="container-app py-8">
      <PageHeader title={title} description={`${matchedFoods.length} dishes${term ? ` · ${matchedCanteens.length} canteens` : ""} across campus`} />

      <CategoryToggleChips value={cat ?? null} onChange={(id) => navigate({ search: (prev) => ({ ...prev, cat: id ?? undefined }) })} />

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border bg-card px-4 py-3 shadow-soft">
        <div className="flex items-center gap-2">
          <Switch id="veg" checked={vegOnly} onCheckedChange={setVegOnly} />
          <Label htmlFor="veg">Veg only</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="stock" checked={inStockOnly} onCheckedChange={setInStockOnly} />
          <Label htmlFor="stock">In stock</Label>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Sort</Label>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-asc">Price: low to high</SelectItem>
              <SelectItem value="price-desc">Price: high to low</SelectItem>
              <SelectItem value="prep">Fastest prep</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {matchedCanteens.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold">Canteens</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {matchedCanteens.map((c) => (
              <CanteenCard key={c.id} canteen={c} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        {matchedCanteens.length > 0 && <h2 className="mb-4 text-xl font-bold">Dishes</h2>}
        {shown.length === 0 ? (
          <EmptyState
            icon={<SearchX />}
            title="Nothing matches that"
            description="Try a different word, or clear your filters."
            action={
              <Button variant="outline" onClick={() => { setVegOnly(false); setInStockOnly(false); navigate({ search: {} }); }}>
                Clear search & filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {shown.map((f) => (
                <FoodCard key={f.id} food={f} showCanteen />
              ))}
            </div>
            {matchedFoods.length > shown.length && (
              <p className="mt-6 text-center text-sm text-muted-foreground">Showing first {shown.length} of {matchedFoods.length}. Narrow with a category or search term.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
