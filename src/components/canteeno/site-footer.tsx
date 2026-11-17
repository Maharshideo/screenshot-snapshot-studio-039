import { Link } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-primary-deep text-primary-foreground">
      <div className="container-app grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-primary-foreground/70">
            Order ahead from your campus canteens and pick up when it&apos;s hot. No queues, no delivery — just grab and go.
          </p>
          <p className="mt-5 inline-flex items-start gap-2 rounded-xl bg-primary-foreground/10 px-3 py-2 text-xs text-primary-foreground/80">
            <FlaskConical className="mt-0.5 size-3.5 shrink-0 text-highlight" />
            Prototype: canteens, menus, prices and orders are demo data saved only in this browser.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary-foreground/60">Eat</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/canteens" className="hover:text-highlight">All canteens</Link></li>
            <li><Link to="/search" className="hover:text-highlight">Search food</Link></li>
            <li><Link to="/cart" className="hover:text-highlight">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary-foreground/60">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/orders" className="hover:text-highlight">Order history</Link></li>
            <li><Link to="/favourites" className="hover:text-highlight">Favourites</Link></li>
            <li><Link to="/profile" className="hover:text-highlight">Profile</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary-foreground/60">Portals</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/staff" className="hover:text-highlight">Canteen staff dashboard</Link></li>
            <li><Link to="/admin" className="hover:text-highlight">Admin dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-app flex flex-col gap-2 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:justify-between">
          <span>© {2026} Canteeno · Self-pickup only</span>
          <span>Built as a college project prototype</span>
        </div>
      </div>
    </footer>
  );
}
