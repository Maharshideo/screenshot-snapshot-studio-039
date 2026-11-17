import { Link } from "@tanstack/react-router";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Canteen } from "@/lib/types";
import { DemoBadge, Rating } from "./bits";

export function OpenStatus({ canteen, className }: { canteen: Canteen; className?: string }) {
  const open = canteen.isOpen && canteen.acceptingOrders;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", open ? "bg-success-soft text-success" : "bg-muted text-muted-foreground", className)}>
      <span className={cn("size-1.5 rounded-full", open ? "bg-success" : "bg-muted-foreground")} />
      {open ? "Open now" : canteen.isOpen ? "Paused" : "Closed"}
    </span>
  );
}

export function CanteenCard({ canteen, className }: { canteen: Canteen; className?: string }) {
  const open = canteen.isOpen && canteen.acceptingOrders;
  return (
    <Link
      to="/canteens/$canteenId"
      params={{ canteenId: canteen.id }}
      className={cn("group flex flex-col overflow-hidden rounded-3xl border bg-card shadow-soft card-hover focus-visible:outline-2 focus-visible:outline-ring", className)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={canteen.image} alt={canteen.name} loading="lazy" width={480} height={300} className={cn("size-full object-cover transition-transform duration-500 group-hover:scale-105", !open && "grayscale-[60%]")} />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        <OpenStatus canteen={canteen} className="absolute left-3 top-3 bg-card" />
        <DemoBadge className="absolute right-3 top-3 bg-card">Demo outlet</DemoBadge>
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-xs font-medium text-background">
          <Clock className="size-3.5" /> ~{canteen.prepTime} min prep
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold leading-tight">{canteen.name}</h3>
          <Rating value={canteen.rating} />
        </div>
        <p className="line-clamp-1 text-sm text-muted-foreground">{canteen.cuisine.join(" · ")}</p>
        <p className="mt-auto inline-flex items-center gap-1 pt-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> {canteen.location}
        </p>
      </div>
    </Link>
  );
}
