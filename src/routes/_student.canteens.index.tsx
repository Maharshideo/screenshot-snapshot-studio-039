import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Store } from "lucide-react";
import { useApp } from "@/store/app-store";
import { CanteenCard } from "@/components/canteeno/canteen-card";
import { DemoNotice, EmptyState, PageHeader } from "@/components/canteeno/bits";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_student/canteens/")({
  head: () => ({
    meta: [
      { title: "All campus canteens — Canteeno" },
      { name: "description", content: "Nescafe, Annapurna, hostel canteens, Amba, LHC Canteen and Surya — see what's open and order ahead for pickup." },
      { property: "og:title", content: "All campus canteens — Canteeno" },
      { property: "og:description", content: "See which campus canteens are open and order ahead for pickup." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CanteensPage,
});

function CanteensPage() {
  const canteens = useApp((s) => s.canteens);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "hostel">("all");
  const [sort, setSort] = useState<"rating" | "prep" | "name">("rating");

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return canteens
      .filter((c) => (filter === "open" ? c.isOpen && c.acceptingOrders : filter === "hostel" ? c.id.startsWith("hostel-") : true))
      .filter((c) => !t || [c.name, c.location, ...c.cuisine].join(" ").toLowerCase().includes(t))
      .sort((a, b) => (sort === "rating" ? b.rating - a.rating : sort === "prep" ? a.prepTime - b.prepTime : a.name.localeCompare(b.name)));
  }, [canteens, q, filter, sort]);

  return (
    <div className="container-app py-8">
      <PageHeader title="All canteens" description={`${canteens.length} outlets on campus · ${canteens.filter((c) => c.isOpen).length} open right now`} />
      <DemoNotice className="mb-5">All outlets are demo listings. Ratings, timings and menus are placeholders until each canteen confirms real data.</DemoNotice>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search canteens or cuisine" className="pl-9" aria-label="Search canteens" />
        </div>
        <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as typeof filter)} className="rounded-full border bg-card p-1">
          <ToggleGroupItem value="all" className="rounded-full px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">All</ToggleGroupItem>
          <ToggleGroupItem value="open" className="rounded-full px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Open now</ToggleGroupItem>
          <ToggleGroupItem value="hostel" className="rounded-full px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Hostels</ToggleGroupItem>
        </ToggleGroup>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="sm:w-44" aria-label="Sort canteens"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Top rated</SelectItem>
            <SelectItem value="prep">Fastest prep</SelectItem>
            <SelectItem value="name">A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<Store />} title="No canteens found" description="Try another search or filter." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((c) => (
            <CanteenCard key={c.id} canteen={c} />
          ))}
        </div>
      )}
    </div>
  );
}
