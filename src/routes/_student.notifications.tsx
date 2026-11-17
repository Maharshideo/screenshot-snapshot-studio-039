import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCheck, Gift, Info, ShoppingBag } from "lucide-react";
import { useApp } from "@/store/app-store";
import { EmptyState, PageHeader, TimeText } from "@/components/canteeno/bits";
import { StudentGate } from "@/components/canteeno/student-gate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_student/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Canteeno" },
      { name: "description", content: "Order updates, pickup alerts and campus offers." },
      { property: "og:title", content: "Notifications — Canteeno" },
      { property: "og:description", content: "Order updates, pickup alerts and campus offers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="container-app max-w-3xl py-8">
      <StudentGate title="Log in to see notifications">{(u) => <List userId={u.id} />}</StudentGate>
    </div>
  ),
});

const ICON = { order: ShoppingBag, offer: Gift, system: Info };

function List({ userId }: { userId: string }) {
  const items = useApp((s) => s.notifications).filter((n) => n.userId === userId);
  const markRead = useApp((s) => s.markNotificationRead);
  const markAll = useApp((s) => s.markAllNotificationsRead);
  const unread = items.filter((n) => !n.read).length;
  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : "You're all caught up"}
        action={unread > 0 && <Button variant="outline" size="sm" onClick={markAll}><CheckCheck /> Mark all read</Button>}
      />
      {items.length === 0 ? (
        <EmptyState icon={<Bell />} title="No notifications" description="Order updates will appear here." />
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const Icon = ICON[n.kind];
            const body = (
              <div className={cn("flex gap-3 rounded-2xl border p-4 transition-colors", n.read ? "bg-card" : "border-primary/20 bg-secondary/50")}>
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", n.kind === "offer" ? "bg-highlight-soft text-highlight" : "bg-secondary text-primary")}>
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{n.title}</p>
                    {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-highlight" aria-label="Unread" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <TimeText iso={n.at} className="text-xs text-muted-foreground" />
                </div>
              </div>
            );
            return (
              <li key={n.id}>
                {n.orderId ? (
                  <Link to="/orders/$orderId" params={{ orderId: n.orderId }} onClick={() => markRead(n.id)} className="block hover:opacity-90">{body}</Link>
                ) : (
                  <button type="button" onClick={() => markRead(n.id)} className="block w-full cursor-pointer text-left">{body}</button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
