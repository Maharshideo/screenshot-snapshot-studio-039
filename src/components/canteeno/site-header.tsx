import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, ChevronDown, Heart, Home, LogOut, MapPin, Receipt, Search, ShoppingBag, Store, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp, useCartCount, useCurrentStudent, useHydrated } from "@/store/app-store";
import { Logo } from "./logo";

export function SearchBox({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const navigate = useNavigate();
  const current = useRouterState({ select: (s) => (s.location.pathname === "/search" ? ((s.location.search as { q?: string }).q ?? "") : "") });
  const [q, setQ] = useState(current);
  useEffect(() => setQ(current), [current]);
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/search", search: q.trim() ? { q: q.trim() } : {} });
      }}
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Search Maggi, coffee, Surya…"
        aria-label="Search food and canteens"
        className="h-11 w-full rounded-full border border-input bg-card pl-10 pr-4 text-sm shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </form>
  );
}

function CountDot({ n, className }: { n: number; className?: string }) {
  if (!n) return null;
  return (
    <span key={n} className={cn("absolute -right-1 -top-1 grid min-w-5 animate-pop place-items-center rounded-full bg-highlight px-1 text-[10px] font-bold text-highlight-foreground ring-2 ring-background", className)}>
      {n > 9 ? "9+" : n}
    </span>
  );
}

export function SiteHeader() {
  const hydrated = useHydrated();
  const user = useCurrentStudent();
  const cartCount = useCartCount();
  const campus = useApp((s) => s.settings.campusName);
  const unread = useApp((s) => s.notifications.filter((n) => n.userId === s.session.userId && !n.read).length);
  const logout = useApp((s) => s.logout);
  const navigate = useNavigate();
  const showCount = hydrated ? cartCount : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="container-app flex h-16 items-center gap-3 lg:gap-6">
        <Logo />
        <span className="hidden items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground md:inline-flex">
          <MapPin className="size-3.5" /> {campus}
        </span>
        <SearchBox className="hidden flex-1 md:block lg:max-w-md" />
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <Button variant="ghost" asChild>
            <Link to="/canteens" activeProps={{ className: "bg-accent" }}>
              Canteens
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/orders" activeProps={{ className: "bg-accent" }}>
              Orders
            </Link>
          </Button>
        </nav>
        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          {user && (
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
                <Bell className="size-5" />
                <CountDot n={unread} />
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/cart" aria-label={`Cart, ${showCount} items`}>
              <ShoppingBag className="size-5" />
              <CountDot n={showCount} />
            </Link>
          </Button>
          {!hydrated ? (
            <span className="h-9 w-20 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 hidden cursor-pointer items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-2.5 shadow-soft transition hover:shadow-card sm:flex">
                  <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{user.name[0]}</span>
                  <span className="max-w-24 truncate text-sm font-semibold">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5">
                <DropdownMenuLabel>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link to="/profile"><User /> Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link to="/orders"><Receipt /> My orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link to="/favourites"><Heart /> Favourites</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link to="/notifications"><Bell /> Notifications</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-lg text-destructive focus:text-destructive"
                  onSelect={() => {
                    logout();
                    toast.success("Logged out");
                    navigate({ to: "/login" });
                  }}
                >
                  <LogOut /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
              <Link to="/login">Log in</Link>
            </Button>
          )}
        </div>
      </div>
      <div className="container-app pb-3 md:hidden">
        <SearchBox />
      </div>
    </header>
  );
}

export function MobileNav() {
  const hydrated = useHydrated();
  const user = useCurrentStudent();
  const items = [
    { to: "/", label: "Home", icon: Home, exact: true },
    { to: "/canteens", label: "Canteens", icon: Store },
    { to: "/search", label: "Search", icon: Search },
    { to: "/orders", label: "Orders", icon: Receipt },
    { to: hydrated && user ? "/profile" : "/login", label: hydrated && user ? "Account" : "Log in", icon: User },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label="Main">
      <ul className="grid grid-cols-5">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              to={it.to}
              activeOptions={{ exact: "exact" in it }}
              className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              <it.icon className="size-5" />
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
