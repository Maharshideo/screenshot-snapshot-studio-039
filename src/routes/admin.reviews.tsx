import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Flag, MessageSquareReply, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";
import { DashHeader } from "@/components/dashboard/dashboard-shell";
import { EmptyState, Stars, TimeText } from "@/components/canteeno/bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Review } from "@/lib/types";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

function AdminReviews() {
  const reviews = useApp((s) => s.reviews);
  const canteens = useApp((s) => s.canteens);
  const patch = useApp((s) => s.patchReview);
  const [tab, setTab] = useState<"all" | Review["status"]>("all");
  const [replying, setReplying] = useState<Review | null>(null);
  const [reply, setReply] = useState("");
  const list = reviews.filter((r) => tab === "all" || r.status === tab);
  const count = (s: Review["status"]) => reviews.filter((r) => r.status === s).length;

  return (
    <>
      <DashHeader title="Reviews & complaints" description="Moderate student reviews. Flagged reviews need attention." />
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-5">
        <TabsList className="rounded-full">
          <TabsTrigger value="all" className="rounded-full">All ({reviews.length})</TabsTrigger>
          <TabsTrigger value="flagged" className="rounded-full">Flagged ({count("flagged")})</TabsTrigger>
          <TabsTrigger value="published" className="rounded-full">Published ({count("published")})</TabsTrigger>
          <TabsTrigger value="hidden" className="rounded-full">Hidden ({count("hidden")})</TabsTrigger>
        </TabsList>
      </Tabs>
      {list.length === 0 ? (
        <EmptyState icon={<MessageSquareText />} title="No reviews here" />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {list.map((r) => (
            <li key={r.id} className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{r.studentName}</p>
                  <p className="text-xs text-muted-foreground">{canteens.find((c) => c.id === r.canteenId)?.name} · <TimeText iso={r.at} /></p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Stars value={r.rating} />
                  <Badge variant={r.status === "published" ? "success" : r.status === "flagged" ? "warning" : "muted"}>{r.status}</Badge>
                </div>
              </div>
              <p className="mt-3 text-sm">{r.comment}</p>
              {r.reply && <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-sm text-secondary-foreground"><b>Reply:</b> {r.reply}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {r.status !== "published" && <Button size="sm" variant="soft" onClick={() => { patch(r.id, { status: "published" }); toast.success("Review published"); }}><Eye /> Publish</Button>}
                {r.status !== "hidden" && <Button size="sm" variant="outline" onClick={() => { patch(r.id, { status: "hidden" }); toast.success("Review hidden"); }}><EyeOff /> Hide</Button>}
                {r.status !== "flagged" && <Button size="sm" variant="ghost" onClick={() => { patch(r.id, { status: "flagged" }); toast.success("Review flagged"); }}><Flag /> Flag</Button>}
                <Button size="sm" variant="ghost" onClick={() => { setReplying(r); setReply(r.reply ?? ""); }}><MessageSquareReply /> {r.reply ? "Edit reply" : "Reply"}</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={!!replying} onOpenChange={(o) => !o && setReplying(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Reply to {replying?.studentName}</DialogTitle>
            <DialogDescription>Replies are shown publicly under the review.</DialogDescription>
          </DialogHeader>
          <Textarea value={reply} onChange={(e) => setReply(e.target.value)} maxLength={240} placeholder="Thanks for the feedback…" />
          <DialogFooter>
            <Button
              onClick={() => {
                if (reply.trim().length < 2) return toast.error("Write a reply first");
                if (replying) patch(replying.id, { reply: reply.trim() });
                toast.success("Reply saved");
                setReplying(null);
              }}
            >
              Save reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
