import { create } from "zustand";
import { toast } from "sonner";
import { useApp } from "@/store/app-store";
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

const usePending = create<{ pending: { foodId: string; qty: number } | null; set: (p: { foodId: string; qty: number } | null) => void }>((set) => ({
  pending: null,
  set: (pending) => set({ pending }),
}));

export function useAddToCart() {
  const addToCart = useApp((s) => s.addToCart);
  const setPending = usePending((s) => s.set);
  return (foodId: string, qty = 1) => {
    const food = useApp.getState().foods.find((f) => f.id === foodId);
    const r = addToCart(foodId, qty);
    if (r.ok) {
      toast.success(`Added ${food?.name ?? "item"}`, { description: qty > 1 ? `${qty} added to your cart` : undefined, duration: 1800 });
      return true;
    }
    if (r.reason === "other-canteen") setPending({ foodId, qty });
    else if (r.reason === "out-of-stock") toast.error("This item is out of stock right now.");
    else if (r.reason === "closed") toast.error("This canteen isn't taking orders right now.");
    else if (r.reason === "max-qty") toast.error("Max 10 of one item per order.");
    else toast.error("This item isn't available.");
    return false;
  };
}

export function CartConflictDialog() {
  const { pending, set } = usePending();
  const replace = useApp((s) => s.replaceCartWith);
  const cartCanteen = useApp((s) => s.canteens.find((c) => c.id === s.cart.canteenId));
  const newCanteen = useApp((s) => {
    const f = s.foods.find((x) => x.id === pending?.foodId);
    return s.canteens.find((c) => c.id === f?.canteenId);
  });
  return (
    <AlertDialog open={!!pending} onOpenChange={(o) => !o && set(null)}>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Start a new cart?</AlertDialogTitle>
          <AlertDialogDescription>
            Your cart has items from <b>{cartCanteen?.name}</b>. Each order is picked up from one canteen, so adding from{" "}
            <b>{newCanteen?.name}</b> will clear your current cart.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Keep current cart</AlertDialogCancel>
          <AlertDialogAction
            className="rounded-full"
            onClick={() => {
              if (pending) {
                replace(pending.foodId, pending.qty);
                toast.success("New cart started", { description: `Picking up from ${newCanteen?.name}` });
              }
              set(null);
            }}
          >
            Clear & add
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
