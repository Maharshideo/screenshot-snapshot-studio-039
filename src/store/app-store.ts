// Local demo state for Canteeno. Everything lives in the browser (localStorage);
// there is no backend yet. Each action maps to a future API call.
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AppNotification,
  Canteen,
  Cart,
  Category,
  FoodItem,
  Order,
  OrderStatus,
  PaymentMethod,
  PlatformSettings,
  Review,
  Session,
  Student,
} from "@/lib/types";
import {
  buildSeedNotifications,
  buildSeedOrders,
  buildSeedReviews,
  seedCanteens,
  seedCategories,
  seedFoods,
  seedSettings,
  seedStudents,
} from "@/data/seed";
import {
  canTransition,
  cartLines,
  checkAddToCart,
  estimatePrepMinutes,
  generateOrderNumber,
  isActive,
  STATUS_LABEL,
  type AddCheck,
} from "@/lib/order-logic";

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;
const nowIso = () => new Date().toISOString();

interface Data {
  canteens: Canteen[];
  foods: FoodItem[];
  categories: Category[];
  students: Student[];
  orders: Order[];
  notifications: AppNotification[];
  reviews: Review[];
  settings: PlatformSettings;
  cart: Cart;
  session: Session;
}

interface Actions {
  // auth (demo)
  loginStudent: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  signupStudent: (input: Pick<Student, "name" | "email" | "password" | "phone" | "rollNo" | "hostel">) => { ok: true } | { ok: false; error: string };
  loginStaff: (canteenId: string) => void;
  loginAdmin: () => void;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<Student, "name" | "phone" | "rollNo" | "hostel" | "email">>) => void;
  // favourites
  toggleFavouriteFood: (foodId: string) => boolean | null;
  toggleFavouriteCanteen: (canteenId: string) => boolean | null;
  // cart
  addToCart: (foodId: string, qty?: number) => AddCheck;
  replaceCartWith: (foodId: string, qty?: number) => void;
  setQty: (foodId: string, qty: number) => void;
  removeFromCart: (foodId: string) => void;
  clearCart: () => void;
  // orders
  placeOrder: (input: { paymentMethod: PaymentMethod; note: string; pickupSlot: string }) => { ok: true; order: Order } | { ok: false; error: string };
  cancelOrder: (orderId: string, reason?: string) => boolean;
  reorder: (orderId: string) => { added: number; skipped: number };
  // staff
  setOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => boolean;
  setOrderPrep: (orderId: string, minutes: number) => void;
  // menu
  upsertFood: (food: Omit<FoodItem, "id"> & { id?: string | undefined }) => FoodItem;
  deleteFood: (foodId: string) => void;
  patchFood: (foodId: string, patch: Partial<FoodItem>) => void;
  // categories
  upsertCategory: (cat: Omit<Category, "id"> & { id?: string | undefined }) => void;
  deleteCategory: (id: string) => { ok: boolean; error?: string };
  // canteens
  upsertCanteen: (c: Omit<Canteen, "id" | "isDemo"> & { id?: string | undefined }) => Canteen;
  patchCanteen: (id: string, patch: Partial<Canteen>) => void;
  deleteCanteen: (id: string) => void;
  // students
  setStudentStatus: (id: string, status: Student["status"]) => void;
  // reviews
  addReview: (input: { canteenId: string; orderId?: string | undefined; rating: number; comment: string }) => void;
  patchReview: (id: string, patch: Partial<Review>) => void;
  // notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // settings
  updateSettings: (patch: Partial<PlatformSettings>) => void;
  resetDemo: () => void;
}

export type AppState = Data & Actions & { hydrated: boolean };

const freshData = (): Data => ({
  canteens: seedCanteens,
  foods: seedFoods,
  categories: seedCategories,
  students: seedStudents,
  orders: buildSeedOrders(),
  notifications: buildSeedNotifications(),
  reviews: buildSeedReviews(),
  settings: seedSettings,
  cart: { canteenId: null, items: [] },
  session: { role: null, userId: null, canteenId: null },
});

function statusNotification(order: Order, status: OrderStatus, canteenName: string): AppNotification {
  const copy: Partial<Record<OrderStatus, [string, string]>> = {
    accepted: ["Order accepted", `${canteenName} accepted ${order.orderNumber}. Estimated ${order.prepMinutes} min.`],
    preparing: ["Your food is being prepared", `${canteenName} started preparing ${order.orderNumber}.`],
    ready: ["Ready for pickup!", `${order.orderNumber} is ready at the ${canteenName} counter. Show your pickup code.`],
    collected: ["Order collected", `Enjoy your meal! Rate ${canteenName}?`],
    rejected: ["Order could not be accepted", `${canteenName} rejected ${order.orderNumber}${order.reason ? `: ${order.reason}` : "."}`],
    cancelled: ["Order cancelled", `${order.orderNumber} was cancelled.`],
  };
  const [title, body] = copy[status] ?? [STATUS_LABEL[status], order.orderNumber];
  return { id: uid("ntf"), userId: order.userId, title, body, at: nowIso(), read: false, orderId: order.id, kind: "order" };
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...freshData(),
      hydrated: false,

      loginStudent: (email, password) => {
        const s = get().students.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
        if (!s) return { ok: false, error: "No account with that email. Try signing up." };
        if (s.password !== password) return { ok: false, error: "Incorrect password." };
        if (s.status === "suspended") return { ok: false, error: "This account is suspended. Contact support." };
        set({ session: { role: "student", userId: s.id, canteenId: null } });
        return { ok: true };
      },
      signupStudent: (input) => {
        if (get().students.some((x) => x.email.toLowerCase() === input.email.trim().toLowerCase()))
          return { ok: false, error: "An account with this email already exists." };
        const student: Student = {
          ...input,
          email: input.email.trim(),
          id: uid("stu"),
          joinedAt: nowIso(),
          status: "active",
          favouriteFoods: [],
          favouriteCanteens: [],
        };
        set((st) => ({
          students: [...st.students, student],
          session: { role: "student", userId: student.id, canteenId: null },
          notifications: [
            { id: uid("ntf"), userId: student.id, title: "Welcome to Canteeno", body: "Order ahead, skip the queue, and pick up when your food is ready.", at: nowIso(), read: false, kind: "system" },
            ...st.notifications,
          ],
        }));
        return { ok: true };
      },
      loginStaff: (canteenId) => set({ session: { role: "staff", userId: null, canteenId } }),
      loginAdmin: () => set({ session: { role: "admin", userId: null, canteenId: null } }),
      logout: () => set({ session: { role: null, userId: null, canteenId: null } }),
      updateProfile: (patch) => {
        const id = get().session.userId;
        if (!id) return;
        set((st) => ({
          students: st.students.map((s) => (s.id === id ? { ...s, ...patch } : s)),
          orders: patch.name ? st.orders.map((o) => (o.userId === id ? { ...o, studentName: patch.name! } : o)) : st.orders,
        }));
      },

      toggleFavouriteFood: (foodId) => {
        const id = get().session.userId;
        if (!id) return null;
        let added = false;
        set((st) => ({
          students: st.students.map((s) => {
            if (s.id !== id) return s;
            added = !s.favouriteFoods.includes(foodId);
            return { ...s, favouriteFoods: added ? [...s.favouriteFoods, foodId] : s.favouriteFoods.filter((f) => f !== foodId) };
          }),
        }));
        return added;
      },
      toggleFavouriteCanteen: (canteenId) => {
        const id = get().session.userId;
        if (!id) return null;
        let added = false;
        set((st) => ({
          students: st.students.map((s) => {
            if (s.id !== id) return s;
            added = !s.favouriteCanteens.includes(canteenId);
            return { ...s, favouriteCanteens: added ? [...s.favouriteCanteens, canteenId] : s.favouriteCanteens.filter((f) => f !== canteenId) };
          }),
        }));
        return added;
      },

      addToCart: (foodId, qty = 1) => {
        const { foods, canteens, cart } = get();
        const food = foods.find((f) => f.id === foodId);
        const canteen = food && canteens.find((c) => c.id === food.canteenId);
        if (!food || !canteen) return { ok: false, reason: "unavailable" };
        const check = checkAddToCart(cart, food, canteen, qty);
        if (!check.ok) return check;
        const exists = cart.items.some((l) => l.foodId === foodId);
        set({
          cart: {
            canteenId: food.canteenId,
            items: exists
              ? cart.items.map((l) => (l.foodId === foodId ? { ...l, qty: l.qty + qty } : l))
              : [...cart.items, { foodId, qty }],
          },
        });
        return check;
      },
      replaceCartWith: (foodId, qty = 1) => {
        const food = get().foods.find((f) => f.id === foodId);
        if (!food) return;
        set({ cart: { canteenId: food.canteenId, items: [{ foodId, qty }] } });
      },
      setQty: (foodId, qty) => {
        if (qty <= 0) return get().removeFromCart(foodId);
        set((st) => ({ cart: { ...st.cart, items: st.cart.items.map((l) => (l.foodId === foodId ? { ...l, qty: Math.min(qty, 10) } : l)) } }));
      },
      removeFromCart: (foodId) =>
        set((st) => {
          const items = st.cart.items.filter((l) => l.foodId !== foodId);
          return { cart: { canteenId: items.length ? st.cart.canteenId : null, items } };
        }),
      clearCart: () => set({ cart: { canteenId: null, items: [] } }),

      placeOrder: ({ paymentMethod, note, pickupSlot }) => {
        const st = get();
        const user = st.students.find((s) => s.id === st.session.userId);
        if (!user) return { ok: false, error: "Please log in to place your order." };
        if (!st.settings.orderingEnabled) return { ok: false, error: "Ordering is paused campus-wide right now." };
        const canteen = st.canteens.find((c) => c.id === st.cart.canteenId);
        if (!canteen) return { ok: false, error: "Your cart is empty." };
        if (!canteen.isOpen || !canteen.acceptingOrders) return { ok: false, error: `${canteen.name} is not accepting orders right now.` };
        const lines = cartLines(st.cart, st.foods);
        if (lines.some((l) => !l.food.inStock || !l.food.available))
          return { ok: false, error: "Some items just went out of stock. Please review your cart." };
        const active = st.orders.filter((o) => o.userId === user.id && isActive(o.status)).length;
        if (active >= st.settings.maxActiveOrders)
          return { ok: false, error: `You can have at most ${st.settings.maxActiveOrders} active orders at a time.` };
        const queue = st.orders.filter((o) => o.canteenId === canteen.id && ["placed", "accepted", "preparing"].includes(o.status)).length;
        const subtotal = lines.reduce((a, l) => a + l.total, 0);
        const at = nowIso();
        const order: Order = {
          id: uid("ord"),
          orderNumber: generateOrderNumber(canteen.code, st.orders.map((o) => o.orderNumber)),
          userId: user.id,
          studentName: user.name,
          canteenId: canteen.id,
          items: lines.map((l) => ({ foodId: l.food.id, name: l.food.name, price: l.food.price, qty: l.qty, isVeg: l.food.isVeg })),
          subtotal,
          total: subtotal,
          status: "placed",
          prepMinutes: estimatePrepMinutes(lines.map((l) => ({ prepTime: l.food.prepTime, qty: l.qty })), queue),
          pickupSlot,
          note: note.trim(),
          paymentMethod,
          placedAt: at,
          history: [{ status: "placed", at }],
        };
        set((s) => ({
          orders: [order, ...s.orders],
          cart: { canteenId: null, items: [] },
          notifications: [
            { id: uid("ntf"), userId: user.id, title: "Order placed", body: `${order.orderNumber} sent to ${canteen.name}. Waiting for the canteen to accept.`, at, read: false, orderId: order.id, kind: "order" },
            ...s.notifications,
          ],
        }));
        return { ok: true, order };
      },
      cancelOrder: (orderId, reason = "Cancelled by student") => {
        const o = get().orders.find((x) => x.id === orderId);
        if (!o || !canTransition(o.status, "cancelled")) return false;
        return get().setOrderStatus(orderId, "cancelled", reason);
      },
      reorder: (orderId) => {
        const st = get();
        const o = st.orders.find((x) => x.id === orderId);
        if (!o) return { added: 0, skipped: 0 };
        const okLines = o.items.filter((l) => {
          const f = st.foods.find((x) => x.id === l.foodId);
          return f && f.inStock && f.available;
        });
        set({ cart: { canteenId: okLines.length ? o.canteenId : null, items: okLines.map((l) => ({ foodId: l.foodId, qty: l.qty })) } });
        return { added: okLines.length, skipped: o.items.length - okLines.length };
      },

      setOrderStatus: (orderId, status, reason) => {
        const st = get();
        const o = st.orders.find((x) => x.id === orderId);
        if (!o || !canTransition(o.status, status)) return false;
        const at = nowIso();
        const updated: Order = { ...o, status, reason: reason ?? o.reason, history: [...o.history, { status, at }] };
        const canteen = st.canteens.find((c) => c.id === o.canteenId);
        set((s) => ({
          orders: s.orders.map((x) => (x.id === orderId ? updated : x)),
          notifications: [statusNotification(updated, status, canteen?.name ?? "The canteen"), ...s.notifications],
        }));
        return true;
      },
      setOrderPrep: (orderId, minutes) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, prepMinutes: Math.max(1, Math.min(120, minutes)) } : o)) })),

      upsertFood: (food) => {
        const saved: FoodItem = { ...food, id: food.id ?? uid(`${food.canteenId}--item`) };
        set((s) => ({ foods: food.id ? s.foods.map((f) => (f.id === food.id ? saved : f)) : [saved, ...s.foods] }));
        return saved;
      },
      deleteFood: (foodId) =>
        set((s) => ({
          foods: s.foods.filter((f) => f.id !== foodId),
          cart: { ...s.cart, items: s.cart.items.filter((l) => l.foodId !== foodId) },
        })),
      patchFood: (foodId, patch) => set((s) => ({ foods: s.foods.map((f) => (f.id === foodId ? { ...f, ...patch } : f)) })),

      upsertCategory: (cat) => {
        const id = cat.id ?? cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 5);
        set((s) => ({
          categories: cat.id ? s.categories.map((c) => (c.id === cat.id ? { ...c, ...cat, id } : c)) : [...s.categories, { ...cat, id }],
        }));
      },
      deleteCategory: (id) => {
        const used = get().foods.filter((f) => f.categoryId === id).length;
        if (used) return { ok: false, error: `${used} food items still use this category. Move them first or hide the category instead.` };
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
        return { ok: true };
      },

      upsertCanteen: (c) => {
        const id = c.id ?? c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 5);
        const saved: Canteen = { ...c, id, isDemo: true };
        set((s) => ({ canteens: c.id ? s.canteens.map((x) => (x.id === c.id ? saved : x)) : [...s.canteens, saved] }));
        return saved;
      },
      patchCanteen: (id, patch) => set((s) => ({ canteens: s.canteens.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCanteen: (id) =>
        set((s) => ({
          canteens: s.canteens.filter((c) => c.id !== id),
          foods: s.foods.filter((f) => f.canteenId !== id),
          cart: s.cart.canteenId === id ? { canteenId: null, items: [] } : s.cart,
        })),

      setStudentStatus: (id, status) => set((s) => ({ students: s.students.map((x) => (x.id === id ? { ...x, status } : x)) })),

      addReview: ({ canteenId, orderId, rating, comment }) => {
        const st = get();
        const user = st.students.find((s) => s.id === st.session.userId);
        if (!user) return;
        set((s) => ({
          reviews: [{ id: uid("rev"), userId: user.id, studentName: user.name, canteenId, orderId, rating, comment: comment.trim(), at: nowIso(), status: "published" }, ...s.reviews],
          orders: orderId ? s.orders.map((o) => (o.id === orderId ? { ...o, reviewed: true } : o)) : s.orders,
        }));
      },
      patchReview: (id, patch) => set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),

      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNotificationsRead: () => {
        const id = get().session.userId;
        set((s) => ({ notifications: s.notifications.map((n) => (n.userId === id ? { ...n, read: true } : n)) }));
      },

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      resetDemo: () => set({ ...freshData() }),
    }),
    {
      name: "canteeno-demo-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ hydrated: _h, ...rest }) =>
        Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== "function")) as Partial<AppState>,
      onRehydrateStorage: () => () => {
        useApp.setState({ hydrated: true });
      },
    },
  ),
);

// ---- selectors / hooks ----
export const useHydrated = () => useApp((s) => s.hydrated);

export const useCurrentStudent = () =>
  useApp((s) => (s.session.role === "student" ? s.students.find((u) => u.id === s.session.userId) ?? null : null));

export const useCartCount = () => useApp((s) => s.cart.items.reduce((n, l) => n + l.qty, 0));
