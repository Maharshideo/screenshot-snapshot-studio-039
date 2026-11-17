import { useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ChefHat, Shield } from "lucide-react";
import { toast } from "sonner";
import { useApp, useHydrated } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/canteeno/logo";
import { Skeleton } from "@/components/ui/skeleton";

/** Demo role gate: renders a sign-in card instead of the dashboard until the role is chosen. */
export function RoleGate({ role, children }: { role: "staff" | "admin"; children: ReactNode }) {
  const hydrated = useHydrated();
  const session = useApp((s) => s.session);
  const canteens = useApp((s) => s.canteens);
  const { loginStaff, loginAdmin } = useApp.getState();
  const [canteenId, setCanteenId] = useState("nescafe");
  const navigate = useNavigate();

  if (!hydrated)
    return (
      <div className="flex min-h-screen">
        <Skeleton className="hidden h-screen w-64 rounded-none lg:block" />
        <div className="flex-1 space-y-4 p-8">
          <Skeleton className="h-9 w-56 rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );

  if (session.role === role && (role === "admin" || canteens.some((c) => c.id === session.canteenId))) return <>{children}</>;

  const Icon = role === "staff" ? ChefHat : Shield;
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-cream px-4">
      <div className="w-full max-w-md animate-fade-up rounded-3xl border bg-card p-8 shadow-lift">
        <Logo />
        <span className="mt-6 grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><Icon className="size-7" /></span>
        <h1 className="mt-4 text-2xl font-extrabold">{role === "staff" ? "Canteen staff sign-in" : "Admin sign-in"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo access only — real staff and admin accounts will need secure authentication once a backend is connected.
        </p>
        {role === "staff" && (
          <div className="mt-5">
            <Label htmlFor="gate-canteen">Canteen you manage</Label>
            <Select value={canteenId} onValueChange={setCanteenId}>
              <SelectTrigger id="gate-canteen" className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{canteens.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        <Button
          size="lg"
          className="mt-5 w-full"
          onClick={() => {
            if (role === "staff") loginStaff(canteenId);
            else loginAdmin();
            toast.success(role === "staff" ? "Signed in to staff dashboard" : "Signed in as admin");
          }}
        >
          Continue to dashboard
        </Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={() => navigate({ to: "/" })}>Back to student site</Button>
      </div>
    </div>
  );
}
