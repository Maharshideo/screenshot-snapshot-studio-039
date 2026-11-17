import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, ChefHat } from "lucide-react";
import { useApp, useHydrated } from "@/store/app-store";
import { isActive, STATUS_LABEL } from "@/lib/order-logic";

export function ActiveOrderPill() {
  const hydrated = useHydrated();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const order = useApp((s) => (s.session.role === "student" ? s.orders.find((o) => o.userId === s.session.userId && isActive(o.status)) : undefined));
  const canteen = useApp((s) => s.canteens.find((c) => c.id === order?.canteenId));
  if (!hydrated || !order || pathname.startsWith("/orders/") || pathname.startsWith("/order-confirmed")) return null;
  const ready = order.status === "ready";
  return (
    <Link
      to="/orders/$orderId"
      params={{ orderId: order.id }}
      className={`fixed bottom-20 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-fade-up items-center gap-3 rounded-2xl px-4 py-3 shadow-lift lg:bottom-6 ${ready ? "bg-highlight text-highlight-foreground" : "bg-primary text-primary-foreground"}`}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-foreground/15">
        <ChefHat className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{ready ? "Ready for pickup!" : STATUS_LABEL[order.status]} · {canteen?.name}</span>
        <span className="block truncate text-xs opacity-80">{order.orderNumber} · tap to track</span>
      </span>
      <ChevronRight className="size-5" />
    </Link>
  );
}
