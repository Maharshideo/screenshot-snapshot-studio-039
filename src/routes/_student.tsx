import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { SiteHeader, MobileNav } from "@/components/canteeno/site-header";
import { SiteFooter } from "@/components/canteeno/site-footer";
import { ActiveOrderPill } from "@/components/canteeno/active-order-pill";

export const Route = createFileRoute("/_student")({
  component: StudentLayout,
});

function StudentLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen flex-col pb-16 lg:pb-0">
      <SiteHeader />
      <main key={pathname} className="flex-1 animate-fade-up">
        <Outlet />
      </main>
      <SiteFooter />
      <ActiveOrderPill />
      <MobileNav />
    </div>
  );
}
