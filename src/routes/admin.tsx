import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ClipboardList, LayoutDashboard, MessageSquareText, Settings, Store, Tags, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RoleGate } from "@/components/dashboard/role-gate";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — Canteeno" },
      { name: "description", content: "Manage canteens, students, orders, categories and reviews across campus." },
      { property: "og:title", content: "Admin dashboard — Canteeno" },
      { property: "og:description", content: "Manage canteens, students, orders and reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RoleGate role="admin">
      <AdminLayout />
    </RoleGate>
  ),
});

function AdminLayout() {
  const flagged = useApp((s) => s.reviews.filter((r) => r.status === "flagged").length);
  const campus = useApp((s) => s.settings.campusName);
  return (
    <DashboardShell
      title="Admin"
      subtitle={`Canteeno · ${campus}`}
      nav={[
        { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
        { to: "/admin/canteens", label: "Canteens", icon: Store },
        { to: "/admin/students", label: "Students", icon: Users },
        { to: "/admin/orders", label: "Orders", icon: ClipboardList },
        { to: "/admin/categories", label: "Categories", icon: Tags },
        { to: "/admin/reviews", label: "Reviews", icon: MessageSquareText, badge: flagged },
        { to: "/admin/settings", label: "Settings", icon: Settings },
      ]}
    >
      <Outlet />
    </DashboardShell>
  );
}
