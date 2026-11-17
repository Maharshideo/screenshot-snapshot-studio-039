import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft", className)}>
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 11h16a8 8 0 0 1-16 0Z" />
        <path d="M9 7c0-1.5 1-2 1-3.5M14 7c0-1.5 1-2 1-3.5" />
      </svg>
      <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-highlight ring-2 ring-background" />
    </span>
  );
}

export function Logo({ className, light, to = "/" }: { className?: string; light?: boolean; to?: "/" | "/staff" | "/admin" }) {
  return (
    <Link to={to} className={cn("flex items-center gap-2.5", className)} aria-label="Canteeno home">
      <LogoMark />
      <span className={cn("font-display text-xl font-bold tracking-tight", light ? "text-primary-foreground" : "text-foreground")}>
        Canteeno
      </span>
    </Link>
  );
}
