import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BarChart3, ClipboardList, LayoutDashboard, Settings, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RoleGate } from "@/components/dashboard/role-gate";
import { useApp } from "@/store/app-store";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Canteen staff dashboard — Canteeno" },
      { name: "description", content: "Manage incoming pickup orders, menu, stock and opening hours." },
      { property: "og:title", content: "Canteen staff dashboard — Canteeno" },
      { property: "og:description", content: "Manage incoming pickup orders, menu and stock." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGate role="staff">
      <StaffLayout />
    </RoleGate>
  ),
});

function StaffLayout() {
  const canteens = useApp((s) => s.canteens);
  const canteenId = useApp((s) => s.session.canteenId);
  const canteen = canteens.find((c) => c.id === canteenId);
  const pending = useApp((s) => s.orders.filter((o) => o.canteenId === canteenId && o.status === "placed").length);
  const { loginStaff, patchCanteen } = useApp.getState();

  const accepting = !!canteen && canteen.isOpen && canteen.acceptingOrders;

  return (
    <DashboardShell
      title="Staff"
      subtitle={canteen?.name}
      nav={[
        { to: "/staff", label: "Overview", icon: LayoutDashboard, exact: true },
        { to: "/staff/orders", label: "Orders", icon: ClipboardList, badge: pending },
        { to: "/staff/menu", label: "Menu & stock", icon: UtensilsCrossed },
        { to: "/staff/analytics", label: "Analytics", icon: BarChart3 },
        { to: "/staff/settings", label: "Canteen settings", icon: Settings },
      ]}
      sidebarExtra={
        <div className="space-y-3 rounded-2xl bg-sidebar-accent p-3">
          <Select value={canteenId ?? undefined} onValueChange={(v) => { loginStaff(v); toast.success(`Switched to ${canteens.find((c) => c.id === v)?.name}`); }}>
            <SelectTrigger className="h-9 border-sidebar-border bg-sidebar text-sidebar-accent-foreground" aria-label="Switch canteen (demo)"><SelectValue /></SelectTrigger>
            <SelectContent>{canteens.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <label className="flex items-center justify-between gap-2 text-sm font-semibold text-sidebar-accent-foreground">
            <span className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${accepting ? "bg-sidebar-primary animate-pulse" : "bg-sidebar-foreground/40"}`} />
              {accepting ? "Accepting orders" : "Not accepting"}
            </span>
            <Switch
              checked={accepting}
              onCheckedChange={(v) => {
                if (!canteen) return;
                patchCanteen(canteen.id, { isOpen: v ? true : canteen.isOpen, acceptingOrders: v });
                toast.success(v ? "Now accepting orders" : "Paused new orders");
              }}
              aria-label="Accepting orders"
            />
          </label>
        </div>
      }
    >
      <Outlet />
    </DashboardShell>
  );
}
