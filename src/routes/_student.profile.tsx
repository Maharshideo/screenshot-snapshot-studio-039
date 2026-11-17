import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bell, Heart, LogOut, Mail, MessageSquareText, Pencil, Phone, Receipt, Home as HomeIcon, IdCard, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";
import { formatPrice } from "@/lib/order-logic";
import { EmptyState, PageHeader, Stars, StatusBadge, TimeText } from "@/components/canteeno/bits";
import { StudentGate } from "@/components/canteeno/student-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Student } from "@/lib/types";

export const Route = createFileRoute("/_student/profile")({
  head: () => ({
    meta: [
      { title: "My profile — Canteeno" },
      { name: "description", content: "Manage your Canteeno profile, saved orders and reviews." },
      { property: "og:title", content: "My profile — Canteeno" },
      { property: "og:description", content: "Manage your Canteeno profile, saved orders and reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="container-app py-8">
      <StudentGate title="Log in to see your profile">{(u) => <Profile user={u} />}</StudentGate>
    </div>
  ),
});

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(60),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().regex(/^[+\d\s-]{10,16}$/, "Enter a valid phone number"),
  rollNo: z.string().trim().min(4, "Enter your roll number").max(20),
  hostel: z.string().trim().max(40),
});

function EditProfileDialog({ user }: { user: Student }) {
  const [open, setOpen] = useState(false);
  const update = useApp((s) => s.updateProfile);
  const students = useApp((s) => s.students);
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: { name: user.name, email: user.email, phone: user.phone, rollNo: user.rollNo, hostel: user.hostel },
  });
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Pencil /> Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Changes are saved in this browser.</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="space-y-3"
          onSubmit={handleSubmit((v) => {
            if (students.some((s) => s.id !== user.id && s.email.toLowerCase() === v.email.toLowerCase()))
              return void setError("email", { message: "Another account uses this email" });
            update(v);
            toast.success("Profile updated");
            setOpen(false);
          })}
        >
          {(["name", "email", "phone", "rollNo", "hostel"] as const).map((k) => (
            <div key={k}>
              <Label htmlFor={`p-${k}`}>{{ name: "Full name", email: "Email", phone: "Phone", rollNo: "Roll number", hostel: "Hostel" }[k]}</Label>
              <Input id={`p-${k}`} className="mt-1" aria-invalid={!!errors[k]} {...register(k)} />
              {errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]?.message}</p>}
            </div>
          ))}
          <DialogFooter className="pt-2">
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Profile({ user }: { user: Student }) {
  const navigate = useNavigate();
  const orders = useApp((s) => s.orders).filter((o) => o.userId === user.id);
  const reviews = useApp((s) => s.reviews).filter((r) => r.userId === user.id);
  const canteens = useApp((s) => s.canteens);
  const logout = useApp((s) => s.logout);
  const reorder = useApp((s) => s.reorder);
  const collected = orders.filter((o) => o.status === "collected");
  const spent = collected.reduce((a, o) => a + o.total, 0);
  const saved = collected.slice(0, 6);

  return (
    <>
      <PageHeader title="My profile" />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="h-fit space-y-4">
          <div className="rounded-3xl border bg-card p-6 shadow-card">
            <div className="flex items-center gap-4">
              <span className="grid size-16 place-items-center rounded-2xl bg-primary font-display text-2xl font-bold text-primary-foreground">{user.name[0]}</span>
              <div className="min-w-0">
                <p className="truncate font-display text-xl font-bold">{user.name}</p>
                <p className="text-sm text-muted-foreground">Member since <TimeText iso={user.joinedAt} mode="date" /></p>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> {user.email}</li>
              <li className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" /> {user.phone}</li>
              <li className="flex items-center gap-2"><IdCard className="size-4 text-muted-foreground" /> {user.rollNo}</li>
              <li className="flex items-center gap-2"><HomeIcon className="size-4 text-muted-foreground" /> {user.hostel || "—"}</li>
            </ul>
            <div className="mt-5 flex gap-2">
              <EditProfileDialog user={user} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive-soft" size="sm"><LogOut /> Log out</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Log out of Canteeno?</AlertDialogTitle>
                    <AlertDialogDescription>Your cart stays saved on this device.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-full">Stay</AlertDialogCancel>
                    <AlertDialogAction className="rounded-full" onClick={() => { logout(); toast.success("Logged out"); navigate({ to: "/login" }); }}>Log out</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { n: orders.length, l: "Orders" },
              { n: reviews.length, l: "Reviews" },
              { n: formatPrice(spent), l: "Spent (demo)" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border bg-card p-3 shadow-soft">
                <p className="font-display text-lg font-bold">{s.n}</p>
                <p className="text-xs text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
          <nav className="grid gap-2">
            {([
              { to: "/orders", icon: Receipt, l: "Order history" },
              { to: "/favourites", icon: Heart, l: "Favourites" },
              { to: "/notifications", icon: Bell, l: "Notifications" },
            ] as const).map((n) => (
              <Link key={n.to} to={n.to} className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 font-semibold shadow-soft hover:bg-accent">
                <n.icon className="size-4 text-primary" /> {n.l}
              </Link>
            ))}
          </nav>
        </aside>

        <Tabs defaultValue="saved">
          <TabsList className="rounded-full">
            <TabsTrigger value="saved" className="rounded-full">Saved orders</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full">My reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="saved" className="mt-4">
            {saved.length === 0 ? (
              <EmptyState icon={<Receipt />} title="No completed orders yet" description="Orders you collect show up here for one-tap reordering." />
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {saved.map((o) => {
                  const c = canteens.find((x) => x.id === o.canteenId);
                  return (
                    <li key={o.id} className="rounded-2xl border bg-card p-4 shadow-soft">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold">{c?.name}</p>
                          <p className="line-clamp-1 text-sm text-muted-foreground">{o.items.map((l) => `${l.qty}× ${l.name}`).join(", ")}</p>
                        </div>
                        <StatusBadge status={o.status} />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-bold">{formatPrice(o.total)}</span>
                        <Button size="sm" variant="soft" onClick={() => { const r = reorder(o.id); if (!r.added) return void toast.error("Items unavailable right now"); toast.success("Added to cart"); navigate({ to: "/cart" }); }}>
                          <RotateCcw /> Reorder
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            {reviews.length === 0 ? (
              <EmptyState icon={<MessageSquareText />} title="No reviews yet" description="Rate a collected order from your order history." />
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-2xl border bg-card p-4 shadow-soft">
                    <div className="flex items-center justify-between">
                      <p className="font-bold">{canteens.find((c) => c.id === r.canteenId)?.name}</p>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-1 text-sm">{r.comment}</p>
                    {r.reply && <p className="mt-2 rounded-xl bg-secondary px-3 py-2 text-sm text-secondary-foreground"><b>Canteen reply:</b> {r.reply}</p>}
                    <p className="mt-2 text-xs text-muted-foreground"><TimeText iso={r.at} /> {r.status !== "published" && `· ${r.status}`}</p>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
