// Domain types. Shaped so they can map 1:1 to future API / MongoDB documents.

export type ID = string;

export interface Category {
  id: ID;
  name: string;
  icon: string; // lucide icon key, see components/canteeno/category-icon.tsx
  active: boolean;
}

export interface OpeningHour {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  open: string; // "08:00"
  close: string; // "22:00"
  closed: boolean;
}

export interface Canteen {
  id: ID;
  name: string;
  code: string; // short code used in order numbers
  tagline: string;
  description: string;
  cuisine: string[];
  location: string;
  image: string;
  rating: number;
  ratingCount: number;
  prepTime: number; // average minutes
  isOpen: boolean;
  acceptingOrders: boolean;
  featured: boolean;
  phone: string;
  openingHours: OpeningHour[];
  isDemo: true;
}

export interface FoodItem {
  id: ID;
  canteenId: ID;
  name: string;
  description: string;
  price: number;
  categoryId: ID;
  isVeg: boolean;
  image: string;
  prepTime: number;
  inStock: boolean; // false => visible but "Out of stock"
  available: boolean; // false => hidden from the student menu
  popular?: boolean;
  recommended?: boolean;
  rating: number;
}

export interface CartLine {
  foodId: ID;
  qty: number;
}

export interface Cart {
  canteenId: ID | null;
  items: CartLine[];
}

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "collected"
  | "cancelled"
  | "rejected";

export interface OrderLine {
  foodId: ID;
  name: string;
  price: number;
  qty: number;
  isVeg: boolean;
}

export type PaymentMethod = "counter" | "upi";

export interface Order {
  id: ID;
  orderNumber: string;
  userId: ID;
  studentName: string;
  canteenId: ID;
  items: OrderLine[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  prepMinutes: number;
  pickupSlot: string; // "asap" or "HH:MM"
  note: string;
  paymentMethod: PaymentMethod;
  placedAt: string; // ISO
  history: { status: OrderStatus; at: string }[];
  reason?: string; // reject / cancel reason
  reviewed?: boolean;
}

export interface Student {
  id: ID;
  name: string;
  email: string;
  password: string; // DEMO ONLY — never store plain passwords with a real backend
  phone: string;
  rollNo: string;
  hostel: string;
  joinedAt: string;
  status: "active" | "suspended";
  favouriteFoods: ID[];
  favouriteCanteens: ID[];
}

export interface AppNotification {
  id: ID;
  userId: ID;
  title: string;
  body: string;
  at: string;
  read: boolean;
  orderId?: ID;
  kind: "order" | "offer" | "system";
}

export interface Review {
  id: ID;
  userId: ID;
  studentName: string;
  canteenId: ID;
  orderId?: ID;
  rating: number;
  comment: string;
  at: string;
  status: "published" | "flagged" | "hidden";
  reply?: string;
}

export interface PlatformSettings {
  platformName: string;
  campusName: string;
  orderingEnabled: boolean;
  maxActiveOrders: number;
  pickupHoldMinutes: number;
  supportEmail: string;
  allowUpi: boolean;
}

export type Role = "student" | "staff" | "admin";

export interface Session {
  role: Role | null;
  userId: ID | null; // student id
  canteenId: ID | null; // staff's canteen
}
