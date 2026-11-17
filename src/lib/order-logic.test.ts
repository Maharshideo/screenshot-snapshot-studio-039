import { describe, expect, it } from "vitest";
import {
  canStudentCancel,
  canTransition,
  cartCount,
  cartSubtotal,
  cartTotal,
  checkAddToCart,
  estimatePrepMinutes,
  generateOrderNumber,
  nextStatus,
} from "./order-logic";
import { seedCanteens, seedFoods } from "@/data/seed";
import type { Cart } from "./types";

const nescafe = seedCanteens.find((c) => c.id === "nescafe")!;
const coldCoffee = seedFoods.find((f) => f.id === "nescafe--cold-coffee")!;
const annapurnaThali = seedFoods.find((f) => f.id === "annapurna--veg-thali")!;

describe("cart totals", () => {
  it("multiplies price by quantity and sums lines", () => {
    const cart: Cart = { canteenId: "nescafe", items: [{ foodId: coldCoffee.id, qty: 3 }] };
    expect(cartSubtotal(cart, seedFoods)).toBe(coldCoffee.price * 3);
    expect(cartCount(cart)).toBe(3);
  });

  it("charges no pickup or delivery fee: total equals subtotal", () => {
    const cart: Cart = { canteenId: "nescafe", items: [{ foodId: coldCoffee.id, qty: 2 }] };
    expect(cartTotal(cart, seedFoods)).toBe(cartSubtotal(cart, seedFoods));
  });
});

describe("adding to cart", () => {
  const empty: Cart = { canteenId: null, items: [] };

  it("blocks out-of-stock items", () => {
    expect(checkAddToCart(empty, { ...coldCoffee, inStock: false }, nescafe)).toEqual({ ok: false, reason: "out-of-stock" });
  });

  it("blocks items when the canteen is closed", () => {
    expect(checkAddToCart(empty, coldCoffee, { ...nescafe, isOpen: false })).toEqual({ ok: false, reason: "closed" });
  });

  it("keeps a cart to a single pickup canteen", () => {
    const cart: Cart = { canteenId: "annapurna", items: [{ foodId: annapurnaThali.id, qty: 1 }] };
    expect(checkAddToCart(cart, coldCoffee, nescafe)).toEqual({ ok: false, reason: "other-canteen" });
  });

  it("caps a single item at 10 units", () => {
    const cart: Cart = { canteenId: "nescafe", items: [{ foodId: coldCoffee.id, qty: 10 }] };
    expect(checkAddToCart(cart, coldCoffee, nescafe)).toEqual({ ok: false, reason: "max-qty" });
  });
});

describe("order status flow", () => {
  it("follows Placed → Accepted → Preparing → Ready → Collected", () => {
    expect(nextStatus("placed")).toBe("accepted");
    expect(nextStatus("accepted")).toBe("preparing");
    expect(nextStatus("preparing")).toBe("ready");
    expect(nextStatus("ready")).toBe("collected");
    expect(nextStatus("collected")).toBeNull();
  });

  it("does not allow skipping steps", () => {
    expect(canTransition("placed", "ready")).toBe(false);
    expect(canTransition("accepted", "collected")).toBe(false);
  });

  it("only allows rejecting a newly placed order", () => {
    expect(canTransition("placed", "rejected")).toBe(true);
    expect(canTransition("preparing", "rejected")).toBe(false);
  });

  it("lets students cancel only before the canteen accepts", () => {
    expect(canStudentCancel({ status: "placed" })).toBe(true);
    expect(canStudentCancel({ status: "accepted" })).toBe(false);
  });
});

describe("prep time estimate", () => {
  it("uses the slowest item plus 1 min per extra unit and 2 min per queued order", () => {
    expect(estimatePrepMinutes([{ prepTime: 4, qty: 2 }, { prepTime: 7, qty: 1 }], 2)).toBe(7 + 2 + 4);
  });

  it("caps the extra-unit and queue additions at 10 minutes each", () => {
    expect(estimatePrepMinutes([{ prepTime: 5, qty: 30 }], 20)).toBe(5 + 10 + 10);
  });
});

describe("order numbers", () => {
  it("never reuses an existing order number", () => {
    let i = 0;
    const seq = [0.1, 0.1, 0.5];
    const n = generateOrderNumber("NC", ["CN-NC-1900"], () => seq[i++] ?? 0);
    expect(n).toBe("CN-NC-5500");
  });
});
