import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";
import { DashHeader, Panel } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const settings = useApp((s) => s.settings);
  const { updateSettings, resetDemo, loginAdmin } = useApp.getState();
  const [draft, setDraft] = useState(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = () => {
    const e: Record<string, string> = {};
    if (draft.campusName.trim().length < 2) e.campusName = "Enter a campus name";
    if (!/^\S+@\S+\.\S+$/.test(draft.supportEmail)) e.supportEmail = "Enter a valid email";
    if (!Number.isInteger(draft.maxActiveOrders) || draft.maxActiveOrders < 1 || draft.maxActiveOrders > 10) e.maxActiveOrders = "1–10";
    if (!Number.isInteger(draft.pickupHoldMinutes) || draft.pickupHoldMinutes < 5 || draft.pickupHoldMinutes > 120) e.pickupHoldMinutes = "5–120 minutes";
    setErrors(e);
    if (Object.keys(e).length) return;
    updateSettings({ ...draft, campusName: draft.campusName.trim(), supportEmail: draft.supportEmail.trim() });
    toast.success("Settings saved");
  };

  return (
    <>
      <DashHeader title="Platform settings" action={<Button onClick={save}>Save settings</Button>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="General">
          <div className="space-y-4">
            {([
              ["campusName", "Campus name", "text"],
              ["supportEmail", "Support email", "email"],
            ] as const).map(([k, l, type]) => (
              <div key={k}>
                <Label htmlFor={k}>{l}</Label>
                <Input id={k} type={type} value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} className="mt-1" aria-invalid={!!errors[k]} />
                {errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>}
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Ordering rules">
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4">
              <span><span className="block font-semibold">Ordering enabled</span><span className="text-sm text-muted-foreground">Turn off to pause all orders campus-wide.</span></span>
              <Switch checked={draft.orderingEnabled} onCheckedChange={(v) => setDraft({ ...draft, orderingEnabled: v })} />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span><span className="block font-semibold">Allow UPI (demo)</span><span className="text-sm text-muted-foreground">Shows the simulated UPI option at checkout.</span></span>
              <Switch checked={draft.allowUpi} onCheckedChange={(v) => setDraft({ ...draft, allowUpi: v })} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              {([
                ["maxActiveOrders", "Max active orders per student"],
                ["pickupHoldMinutes", "Hold ready orders for (min)"],
              ] as const).map(([k, l]) => (
                <div key={k}>
                  <Label htmlFor={k}>{l}</Label>
                  <Input id={k} type="number" value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: Number(e.target.value) })} className="mt-1" aria-invalid={!!errors[k]} />
                  {errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>}
                </div>
              ))}
            </div>
          </div>
        </Panel>
        <Panel title="Demo data" className="xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Everything in this prototype is saved in this browser only. Reset to restore the original sample canteens, menus and orders.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive-soft"><RotateCcw /> Reset demo data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
                  <AlertDialogDescription>All orders, menu edits, new canteens and accounts created in this browser will be lost.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { resetDemo(); loginAdmin(); setDraft(useApp.getState().settings); toast.success("Demo data reset"); }}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Panel>
      </div>
    </>
  );
}
