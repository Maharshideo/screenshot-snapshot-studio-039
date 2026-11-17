import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";
import { formatPrice } from "@/lib/order-logic";
import { DashHeader, Panel } from "@/components/dashboard/dashboard-shell";
import { TimeText } from "@/components/canteeno/bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Student } from "@/lib/types";

export const Route = createFileRoute("/admin/students")({
  component: AdminStudents,
});

function AdminStudents() {
  const students = useApp((s) => s.students);
  const orders = useApp((s) => s.orders);
  const setStatus = useApp((s) => s.setStudentStatus);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirm, setConfirm] = useState<Student | null>(null);
  const t = q.trim().toLowerCase();
  const list = students.filter((s) => (filter === "all" || s.status === filter) && (!t || [s.name, s.email, s.rollNo, s.hostel].join(" ").toLowerCase().includes(t)));

  return (
    <>
      <DashHeader title="Students" description={`${students.length} registered · ${students.filter((s) => s.status === "active").length} active`} />
      <Panel>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, roll no." className="pl-9" aria-label="Search students" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="sm:w-40" aria-label="Status filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="-mx-5 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Student</TableHead>
                <TableHead>Roll no.</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 && (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No students match.</TableCell></TableRow>
              )}
              {list.map((s) => {
                const mine = orders.filter((o) => o.userId === s.id);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-full bg-secondary font-bold text-primary">{s.name[0]}</span>
                        <div><p className="font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">{s.email}</p></div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{s.rollNo}</TableCell>
                    <TableCell>{s.hostel || "—"}</TableCell>
                    <TableCell className="tabular-nums">{mine.length}</TableCell>
                    <TableCell className="tabular-nums">{formatPrice(mine.filter((o) => o.status === "collected").reduce((a, o) => a + o.total, 0))}</TableCell>
                    <TableCell><TimeText iso={s.joinedAt} mode="date" className="text-sm" /></TableCell>
                    <TableCell><Badge variant={s.status === "active" ? "success" : "danger"}>{s.status}</Badge></TableCell>
                    <TableCell className="pr-5 text-right">
                      {s.status === "active" ? (
                        <Button size="sm" variant="destructive-soft" onClick={() => setConfirm(s)}><UserX /> Suspend</Button>
                      ) : (
                        <Button size="sm" variant="soft" onClick={() => { setStatus(s.id, "active"); toast.success(`${s.name} reactivated`); }}><UserCheck /> Reactivate</Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Panel>
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend {confirm?.name}?</AlertDialogTitle>
            <AlertDialogDescription>They won&apos;t be able to log in or place orders until reactivated.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (confirm) { setStatus(confirm.id, "suspended"); toast.success(`${confirm.name} suspended`); } }}>Suspend</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
