import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";
import { DashHeader, Panel } from "@/components/dashboard/dashboard-shell";
import { useStaffCanteen } from "@/components/dashboard/use-staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import type { OpeningHour } from "@/lib/types";

export const Route = createFileRoute("/staff/settings")({
  component: StaffSettings,
});

function StaffSettings() {
  const canteen = useStaffCanteen();
  const patchCanteen = useApp((s) => s.patchCanteen);
  const [hours, setHours] = useState<OpeningHour[]>(canteen.openingHours);
  const [prep, setPrep] = useState(canteen.prepTime);
  const [info, setInfo] = useState({ tagline: canteen.tagline, description: canteen.description, phone: canteen.phone, location: canteen.location });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setHours(canteen.openingHours);
    setPrep(canteen.prepTime);
    setInfo({ tagline: canteen.tagline, description: canteen.description, phone: canteen.phone, location: canteen.location });
    setErrors({});
  }, [canteen.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveHours = () => {
    const bad = hours.find((h) => !h.closed && (!h.open || !h.close || h.open === h.close));
    if (bad) return toast.error(`Check the hours for ${bad.day}`);
    patchCanteen(canteen.id, { openingHours: hours });
    toast.success("Opening hours saved");
  };

  const saveInfo = () => {
    const e: Record<string, string> = {};
    if (info.tagline.trim().length < 3) e.tagline = "Add a short tagline";
    if (info.location.trim().length < 3) e.location = "Add a location";
    if (!/^[+\d\s-]{10,16}$/.test(info.phone.trim())) e.phone = "Enter a valid phone";
    setErrors(e);
    if (Object.keys(e).length) return;
    patchCanteen(canteen.id, { ...info, prepTime: prep });
    toast.success("Canteen details saved");
  };

  return (
    <>
      <DashHeader title="Canteen settings" description={`${canteen.name} · changes show on the student site instantly (in this browser).`} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Availability">
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4">
              <span><span className="block font-semibold">Canteen open</span><span className="text-sm text-muted-foreground">Closed canteens show as &ldquo;Closed&rdquo; to students.</span></span>
              <Switch checked={canteen.isOpen} onCheckedChange={(v) => { patchCanteen(canteen.id, { isOpen: v, acceptingOrders: v ? canteen.acceptingOrders : false }); toast.success(v ? "Canteen opened" : "Canteen closed"); }} />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span><span className="block font-semibold">Accepting new orders</span><span className="text-sm text-muted-foreground">Pause during rush hour without closing.</span></span>
              <Switch checked={canteen.acceptingOrders} disabled={!canteen.isOpen} onCheckedChange={(v) => { patchCanteen(canteen.id, { acceptingOrders: v }); toast.success(v ? "Accepting orders" : "Orders paused"); }} />
            </label>
            <div>
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Average prep time</Label>
                <span className="font-display text-lg font-bold">{prep} min</span>
              </div>
              <Slider className="mt-3" min={2} max={45} step={1} value={[prep]} onValueChange={([v]) => setPrep(v)} aria-label="Average prep time" />
              <p className="mt-2 text-xs text-muted-foreground">Shown on canteen cards. Save details below to apply.</p>
            </div>
          </div>
        </Panel>

        <Panel title="Opening hours" action={<Button size="sm" onClick={saveHours}>Save hours</Button>}>
          <ul className="space-y-2">
            {hours.map((h, i) => (
              <li key={h.day} className="flex items-center gap-3">
                <span className="w-10 font-semibold">{h.day}</span>
                <Input type="time" value={h.open} disabled={h.closed} onChange={(e) => setHours(hours.map((x, j) => (j === i ? { ...x, open: e.target.value } : x)))} className="h-9 w-28" aria-label={`${h.day} opens`} />
                <span className="text-muted-foreground">–</span>
                <Input type="time" value={h.close} disabled={h.closed} onChange={(e) => setHours(hours.map((x, j) => (j === i ? { ...x, close: e.target.value } : x)))} className="h-9 w-28" aria-label={`${h.day} closes`} />
                <label className="ml-auto flex items-center gap-2 text-sm">
                  <Switch checked={h.closed} onCheckedChange={(v) => setHours(hours.map((x, j) => (j === i ? { ...x, closed: v } : x)))} aria-label={`${h.day} closed`} /> Closed
                </label>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Canteen details" className="xl:col-span-2" action={<Button size="sm" onClick={saveInfo}>Save details</Button>}>
          <div className="grid gap-4 md:grid-cols-2">
            {([
              ["tagline", "Tagline"],
              ["location", "Location"],
              ["phone", "Phone"],
            ] as const).map(([k, l]) => (
              <div key={k}>
                <Label htmlFor={`s-${k}`}>{l}</Label>
                <Input id={`s-${k}`} value={info[k]} onChange={(e) => setInfo({ ...info, [k]: e.target.value })} className="mt-1" aria-invalid={!!errors[k]} />
                {errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>}
              </div>
            ))}
            <div className="md:col-span-2">
              <Label htmlFor="s-desc">Description</Label>
              <Textarea id="s-desc" value={info.description} onChange={(e) => setInfo({ ...info, description: e.target.value })} className="mt-1" maxLength={300} />
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
