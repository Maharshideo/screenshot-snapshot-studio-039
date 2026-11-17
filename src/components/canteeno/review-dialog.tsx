import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useApp } from "@/store/app-store";
import { Stars } from "./bits";

export function ReviewDialog({ canteenId, orderId, trigger }: { canteenId: string; orderId?: string; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const addReview = useApp((s) => s.addReview);
  const canteen = useApp((s) => s.canteens.find((c) => c.id === canteenId));

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setRating(0); setComment(""); setError(null); } }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Rate {canteen?.name}</DialogTitle>
          <DialogDescription>Your review helps other students and the canteen team.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!rating) return setError("Choose a star rating.");
            if (comment.trim().length < 5) return setError("Write at least a few words (5+ characters).");
            addReview({ canteenId, orderId, rating, comment });
            toast.success("Thanks for your review!");
            setOpen(false);
          }}
        >
          <div className="flex justify-center py-2">
            <Stars value={rating} size="lg" onChange={setRating} />
          </div>
          <div>
            <Label htmlFor="review-comment">Your review</Label>
            <Textarea id="review-comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={300} placeholder="How was the food and the pickup?" className="mt-1.5" />
          </div>
          {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit">Submit review</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
