import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChefHat, GraduationCap, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/canteeno/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => {
    const r = s["redirect"];
    return { redirect: typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? r : undefined };
  },
  head: () => ({
    meta: [
      { title: "Log in — Canteeno" },
      { name: "description", content: "Log in to order from campus canteens, or open the staff and admin dashboards." },
      { property: "og:title", content: "Log in — Canteeno" },
      { property: "og:description", content: "Log in to order ahead from campus canteens." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { loginStudent, loginStaff, loginAdmin } = useApp.getState();
  const canteens = useApp((s) => s.canteens);
  const [staffCanteen, setStaffCanteen] = useState("nescafe");
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const { redirect } = Route.useSearch();
  const finishStudent = () => {
    toast.success("Welcome back!");
    if (redirect) router.history.push(redirect);
    else navigate({ to: "/" });
  };

  return (
    <AuthShell>
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="mt-1 text-muted-foreground">Choose how you&apos;re signing in.</p>
      <Tabs defaultValue="student" className="mt-6">
        <TabsList className="grid w-full grid-cols-3 rounded-full">
          <TabsTrigger value="student" className="rounded-full"><GraduationCap className="size-4" /> Student</TabsTrigger>
          <TabsTrigger value="staff" className="rounded-full"><ChefHat className="size-4" /> Staff</TabsTrigger>
          <TabsTrigger value="admin" className="rounded-full"><Shield className="size-4" /> Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="student" className="mt-6">
          <form
            noValidate
            className="space-y-4"
            onSubmit={form.handleSubmit((v) => {
              setServerError(null);
              const r = loginStudent(v.email, v.password);
              if (!r.ok) return void setServerError(r.error);
              finishStudent();
            })}
          >
            <div>
              <Label htmlFor="email">Campus email</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="you@campus.edu" className="mt-1.5" aria-invalid={!!form.formState.errors.email} {...form.register("email")} />
              {form.formState.errors.email && <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" className="mt-1.5" aria-invalid={!!form.formState.errors.password} {...form.register("password")} />
              {form.formState.errors.password && <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>}
            </div>
            {serverError && <p role="alert" className="rounded-xl bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive">{serverError}</p>}
            <Button type="submit" size="lg" className="w-full">Log in</Button>
            <Button
              type="button"
              variant="soft"
              size="lg"
              className="w-full"
              onClick={() => {
                form.setValue("email", "aarav@campus.edu");
                form.setValue("password", "demo1234");
                const r = loginStudent("aarav@campus.edu", "demo1234");
                if (r.ok) finishStudent();
              }}
            >
              <Sparkles /> Use demo student account
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              New here? <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account</Link>
            </p>
          </form>
        </TabsContent>

        <TabsContent value="staff" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">Demo access: pick the canteen you manage. Real staff accounts will need proper authentication later.</p>
          <div>
            <Label htmlFor="staff-canteen">Your canteen</Label>
            <Select value={staffCanteen} onValueChange={setStaffCanteen}>
              <SelectTrigger id="staff-canteen" className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {canteens.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button size="lg" className="w-full" onClick={() => { loginStaff(staffCanteen); toast.success("Signed in to staff dashboard"); navigate({ to: "/staff" }); }}>
            Open staff dashboard
          </Button>
        </TabsContent>

        <TabsContent value="admin" className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">Demo access to the platform admin dashboard.</p>
          <Button size="lg" className="w-full" onClick={() => { loginAdmin(); toast.success("Signed in as admin"); navigate({ to: "/admin" }); }}>
            Open admin dashboard
          </Button>
        </TabsContent>
      </Tabs>
    </AuthShell>
  );
}
