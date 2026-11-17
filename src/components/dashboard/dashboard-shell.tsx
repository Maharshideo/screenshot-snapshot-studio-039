import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ExternalLink, LogOut, Menu, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { LogoMark } from "@/components/canteeno/logo";
import { DemoBadge } from "@/components/canteeno/bits";
import { useApp } from "@/store/app-store";

export type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean; badge?: number };

function SidebarContent({ title, subtitle, nav, footer, onNavigate }: { title: string; subtitle: ReactNode; nav: NavItem[]; footer?: ReactNode; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const logout = useApp((s) => s.logout);
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <LogoMark className="bg-sidebar-primary text-sidebar-primary-foreground" />
        <div className="min-w-0">
          <p className="font-display text-lg font-bold leading-none text-sidebar-accent-foreground">{title}</p>
          <div className="mt-1 truncate text-xs text-sidebar-foreground/70">{subtitle}</div>
        </div>
      </div>
      {footer && <div className="px-4 pb-3">{footer}</div>}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Dashboard">
        {nav.map((n) => {
          const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <n.icon className="size-4" />
              <span className="flex-1">{n.label}</span>
              {!!n.badge && <span className={cn("grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold", active ? "bg-card text-highlight" : "bg-sidebar-primary text-sidebar-primary-foreground")}>{n.badge}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-sidebar-border p-3">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-sidebar-accent">
          <ExternalLink className="size-4" /> Student site
        </Link>
        <button
          type="button"
          onClick={() => { logout(); toast.success("Logged out"); navigate({ to: "/login" }); }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-sidebar-accent"
        >
          <LogOut className="size-4" /> Log out
        </button>
      </div>
    </div>
  );
}

export function DashboardShell({ title, subtitle, nav, sidebarExtra, children }: { title: string; subtitle: ReactNode; nav: NavItem[]; sidebarExtra?: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen bg-cream/50">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        <SidebarContent title={title} subtitle={subtitle} nav={nav} footer={sidebarExtra} />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0">
          <SheetTitle className="sr-only">{title} navigation</SheetTitle>
          <SheetDescription className="sr-only">Dashboard sections</SheetDescription>
          <SidebarContent title={title} subtitle={subtitle} nav={nav} footer={sidebarExtra} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-xl sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
          <p className="font-display font-bold lg:hidden">{title}</p>
          <DemoBadge className="ml-auto">Demo data · local only</DemoBadge>
        </header>
        <main key={pathname} className="flex-1 animate-fade-up p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = "primary" }: { label: string; value: ReactNode; hint?: ReactNode; icon: LucideIcon; tone?: "primary" | "highlight" | "info" | "warning" }) {
  const tones = {
    primary: "bg-secondary text-primary",
    highlight: "bg-highlight-soft text-highlight",
    info: "bg-info-soft text-info",
    warning: "bg-warning-soft text-warning",
  };
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("grid size-9 place-items-center rounded-xl", tones[tone])}><Icon className="size-4" /></span>
      </div>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border bg-card shadow-soft", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
          {title && <h2 className="font-display text-base font-bold">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function DashHeader({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}
