import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/app-store";
import { categoryImage } from "@/data/images";
import { CategoryIcon } from "./category-icon";

/** Large image chips used on the home page — each links to search filtered by category. */
export function CategoryRail() {
  const categories = useApp((s) => s.categories.filter((c) => c.active));
  return (
    <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {categories.map((c) => (
        <Link
          key={c.id}
          to="/search"
          search={{ cat: c.id }}
          className="group flex w-24 shrink-0 flex-col items-center gap-2 text-center sm:w-28"
        >
          <span className="relative block size-20 overflow-hidden rounded-full border-4 border-card shadow-card transition-transform group-hover:-translate-y-1 sm:size-24">
            {categoryImage[c.id] ? (
              <img src={categoryImage[c.id]} alt="" loading="lazy" width={96} height={96} className="size-full object-cover" />
            ) : (
              <span className="grid size-full place-items-center bg-secondary text-primary">
                <CategoryIcon icon={c.icon} className="size-8" />
              </span>
            )}
          </span>
          <span className="text-xs font-semibold leading-tight sm:text-sm">{c.name}</span>
        </Link>
      ))}
    </div>
  );
}

/** Compact toggle chips for filtering a list in place. */
export function CategoryToggleChips({
  value,
  onChange,
  ids,
  className,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  ids?: string[];
  className?: string;
}) {
  const categories = useApp((s) => s.categories.filter((c) => c.active && (!ids || ids.includes(c.id))));
  const chip = (active: boolean) =>
    cn(
      "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
      active ? "border-primary bg-primary text-primary-foreground shadow-soft" : "bg-card hover:border-primary/40 hover:bg-accent",
    );
  return (
    <div className={cn("scrollbar-none flex gap-2 overflow-x-auto pb-1", className)} role="tablist" aria-label="Food categories">
      <button type="button" role="tab" aria-selected={value === null} className={chip(value === null)} onClick={() => onChange(null)}>
        All
      </button>
      {categories.map((c) => (
        <button key={c.id} type="button" role="tab" aria-selected={value === c.id} className={chip(value === c.id)} onClick={() => onChange(c.id)}>
          <CategoryIcon icon={c.icon} className="size-4" />
          {c.name}
        </button>
      ))}
    </div>
  );
}
