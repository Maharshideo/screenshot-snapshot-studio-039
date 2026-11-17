// Pure business rules for carts and orders. Kept framework-free so they can move
// to an API layer unchanged and are easy to unit test.
import type { Canteen, Cart, FoodItem, Order, OrderStatus } from "./types";

export const ORDER_FLOW: OrderStatus[] = ["placed", "accepted", "preparing", "ready", "collected"];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  collected: "Collected",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export const ACTIVE_STATUSES: OrderStatus[] = ["placed", "accepted", "preparing", "ready"];

export function isActive(status: OrderStatus) {
  return ACTIVE_STATUSES.includes(status);
}

/** Next status in the pickup flow, or null when the order is finished. */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = ORDER_FLOW.indexOf(status);
  if (i === -1 || i === ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[i + 1] ?? null;
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (to === "rejected") return from === "placed";
  if (to === "cancelled") return from === "placed";
  return nextStatus(from) === to;
}

/** Students may cancel only until the canteen accepts the order. */
export function canStudentCancel(order: Pick<Order, "status">) {
  return order.status === "placed";
}

export function lineTotal(price: number, qty: number) {
  return price * qty;
}

export function cartLines(cart: Cart, foods: FoodItem[]) {
  return cart.items
    .map((line) => {
      const food = foods.find((f) => f.id === line.foodId);
      return food ? { food, qty: line.qty, total: lineTotal(food.price, line.qty) } : null;
    })
    .filter((x): x is { food: FoodItem; qty: number; total: number } => x !== null);
}

export function cartSubtotal(cart: Cart, foods: FoodItem[]) {
  return cartLines(cart, foods).reduce((sum, l) => sum + l.total, 0);
}

export function cartCount(cart: Cart) {
  return cart.items.reduce((n, l) => n + l.qty, 0);
}

/** Pickup is free: the payable total equals the item subtotal. */
export function cartTotal(cart: Cart, foods: FoodItem[]) {
  return cartSubtotal(cart, foods);
}

/**
 * Estimated preparation time: the slowest item, plus 1 minute for each extra unit
 * (capped at +10), plus 2 minutes per order already in the canteen's queue (capped at +10).
 */
export function estimatePrepMinutes(
  lines: { prepTime: number; qty: number }[],
  queueLength = 0,
) {
  if (lines.length === 0) return 0;
  const slowest = Math.max(...lines.map((l) => l.prepTime));
  const units = lines.reduce((n, l) => n + l.qty, 0);
  const extraUnits = Math.min(Math.max(units - 1, 0), 10);
  const queue = Math.min(queueLength * 2, 10);
  return slowest + extraUnits + queue;
}

export const MAX_QTY_PER_ITEM = 10;

export type AddCheck =
  | { ok: true }
  | { ok: false; reason: "out-of-stock" | "closed" | "other-canteen" | "max-qty" | "unavailable" };

export function checkAddToCart(
  cart: Cart,
  food: FoodItem,
  canteen: Canteen,
  qty = 1,
): AddCheck {
  if (!food.available) return { ok: false, reason: "unavailable" };
  if (!food.inStock) return { ok: false, reason: "out-of-stock" };
  if (!canteen.isOpen || !canteen.acceptingOrders) return { ok: false, reason: "closed" };
  if (cart.canteenId && cart.canteenId !== food.canteenId && cart.items.length > 0)
    return { ok: false, reason: "other-canteen" };
  const existing = cart.items.find((l) => l.foodId === food.id)?.qty ?? 0;
  if (existing + qty > MAX_QTY_PER_ITEM) return { ok: false, reason: "max-qty" };
  return { ok: true };
}

/** Demo order number: CN-<canteen code>-<4 digits>, unique among existing orders. */
export function generateOrderNumber(code: string, existing: string[], rand = Math.random) {
  for (let i = 0; i < 50; i++) {
    const n = `CN-${code}-${String(Math.floor(1000 + rand() * 9000))}`;
    if (!existing.includes(n)) return n;
  }
  return `CN-${code}-${Date.now().toString().slice(-6)}`;
}

export function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}
