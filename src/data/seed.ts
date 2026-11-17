// DEMO DATA ONLY. Canteens, menus, prices, ratings and orders below are illustrative
// placeholders for the Canteeno prototype — they are not real figures.
import type {
  AppNotification,
  Canteen,
  Category,
  FoodItem,
  OpeningHour,
  Order,
  OrderStatus,
  PlatformSettings,
  Review,
  Student,
} from "@/lib/types";
import { categoryImage, images } from "./images";

export const seedCategories: Category[] = [
  { id: "chocolates", name: "Chocolates", icon: "candy-bar", active: true },
  { id: "candies", name: "Candies", icon: "candy", active: true },
  { id: "chips", name: "Chips", icon: "popcorn", active: true },
  { id: "snacks", name: "Snacks", icon: "cookie", active: true },
  { id: "noodles", name: "Maggi & Noodles", icon: "soup", active: true },
  { id: "sandwiches", name: "Sandwiches", icon: "sandwich", active: true },
  { id: "burgers", name: "Burgers", icon: "beef", active: true },
  { id: "beverages", name: "Beverages", icon: "cup-soda", active: true },
  { id: "coffee", name: "Coffee", icon: "coffee", active: true },
  { id: "breakfast", name: "Breakfast", icon: "egg-fried", active: true },
  { id: "lunch", name: "Lunch", icon: "salad", active: true },
  { id: "dinner", name: "Dinner", icon: "utensils-crossed", active: true },
  { id: "meals", name: "Full Meals", icon: "chef-hat", active: true },
];

type Template = {
  slug: string;
  name: string;
  cat: string;
  veg: boolean;
  price: number;
  prep: number;
  desc: string;
  image?: string;
};

const T: Template[] = [
  // chocolates
  { slug: "milk-choc", name: "Milk Chocolate Bar", cat: "chocolates", veg: true, price: 40, prep: 1, desc: "Creamy milk chocolate, 50g bar." },
  { slug: "dark-choc", name: "Dark Chocolate 55%", cat: "chocolates", veg: true, price: 60, prep: 1, desc: "Rich, slightly bitter dark chocolate." },
  { slug: "wafer-choc", name: "Chocolate Wafer Bar", cat: "chocolates", veg: true, price: 30, prep: 1, desc: "Crispy wafer fingers coated in chocolate." },
  // candies
  { slug: "toffee", name: "Fruit Toffees (5 pcs)", cat: "candies", veg: true, price: 10, prep: 1, desc: "Chewy assorted fruit toffees." },
  { slug: "mango-candy", name: "Mango Candy (10 pcs)", cat: "candies", veg: true, price: 10, prep: 1, desc: "Tangy raw-mango hard candies." },
  { slug: "gummies", name: "Gummy Bears Pack", cat: "candies", veg: true, price: 25, prep: 1, desc: "Soft fruity gummies, small pack." },
  // chips
  { slug: "salted-chips", name: "Classic Salted Chips", cat: "chips", veg: true, price: 20, prep: 1, desc: "Thin, crisp, lightly salted." },
  { slug: "masala-chips", name: "Masala Chips", cat: "chips", veg: true, price: 20, prep: 1, desc: "Spicy desi masala potato chips." },
  { slug: "nachos", name: "Nachos with Salsa", cat: "chips", veg: true, price: 60, prep: 5, desc: "Corn tortilla chips with tomato salsa and cheese dip." },
  // snacks
  { slug: "samosa", name: "Samosa (2 pcs)", cat: "snacks", veg: true, price: 24, prep: 3, desc: "Crispy pastry with spiced potato, green chutney." },
  { slug: "vada-pav", name: "Vada Pav", cat: "snacks", veg: true, price: 25, prep: 4, desc: "Mumbai-style potato fritter in a soft pav." },
  { slug: "paneer-pakora", name: "Paneer Pakora", cat: "snacks", veg: true, price: 50, prep: 8, desc: "Gram-flour battered paneer, fried golden." },
  { slug: "chicken-momos", name: "Chicken Momos (8 pcs)", cat: "snacks", veg: false, price: 80, prep: 10, desc: "Steamed dumplings with spicy red chutney." },
  { slug: "veg-puff", name: "Veg Puff", cat: "snacks", veg: true, price: 25, prep: 2, desc: "Flaky puff pastry with mixed veg filling." },
  // noodles
  { slug: "plain-maggi", name: "Plain Maggi", cat: "noodles", veg: true, price: 30, prep: 6, desc: "The classic 2-minute hostel favourite." },
  { slug: "cheese-maggi", name: "Masala Cheese Maggi", cat: "noodles", veg: true, price: 50, prep: 7, desc: "Extra masala, loaded with melted cheese." },
  { slug: "veg-maggi", name: "Veg Masala Maggi", cat: "noodles", veg: true, price: 45, prep: 7, desc: "Tossed with peas, onion, tomato and capsicum." },
  { slug: "egg-maggi", name: "Egg Maggi", cat: "noodles", veg: false, price: 55, prep: 8, desc: "Maggi with scrambled egg and green chilli." },
  { slug: "hakka", name: "Veg Hakka Noodles", cat: "noodles", veg: true, price: 70, prep: 10, desc: "Indo-Chinese wok-tossed noodles." },
  // sandwiches
  { slug: "veg-grill", name: "Veg Grilled Sandwich", cat: "sandwiches", veg: true, price: 50, prep: 7, desc: "Grilled with veggies and mint chutney." },
  { slug: "cheese-corn", name: "Cheese Corn Sandwich", cat: "sandwiches", veg: true, price: 60, prep: 7, desc: "Sweet corn and mozzarella, toasted." },
  { slug: "bombay", name: "Bombay Masala Sandwich", cat: "sandwiches", veg: true, price: 55, prep: 8, desc: "Potato masala, beetroot, cucumber, chutney." },
  { slug: "chicken-club", name: "Chicken Club Sandwich", cat: "sandwiches", veg: false, price: 95, prep: 10, desc: "Triple-decker with chicken, egg and mayo." },
  // burgers
  { slug: "aloo-tikki-burger", name: "Aloo Tikki Burger", cat: "burgers", veg: true, price: 45, prep: 7, desc: "Spiced potato patty, onions, tangy sauce." },
  { slug: "veg-cheese-burger", name: "Veg Cheese Burger", cat: "burgers", veg: true, price: 65, prep: 8, desc: "Veg patty with a slice of cheese." },
  { slug: "paneer-zinger", name: "Paneer Zinger Burger", cat: "burgers", veg: true, price: 85, prep: 10, desc: "Crispy coated paneer with peri-peri mayo." },
  { slug: "chicken-burger", name: "Crispy Chicken Burger", cat: "burgers", veg: false, price: 99, prep: 10, desc: "Crunchy fried chicken, lettuce, mayo." },
  // beverages
  { slug: "chai", name: "Masala Chai", cat: "beverages", veg: true, price: 15, prep: 3, desc: "Kadak ginger-cardamom tea." },
  { slug: "lime-soda", name: "Fresh Lime Soda", cat: "beverages", veg: true, price: 35, prep: 3, desc: "Sweet, salted or mixed." },
  { slug: "lassi", name: "Mango Lassi", cat: "beverages", veg: true, price: 50, prep: 4, desc: "Thick yoghurt shake with mango pulp." },
  { slug: "cold-drink", name: "Cold Drink (300 ml)", cat: "beverages", veg: true, price: 25, prep: 1, desc: "Chilled soft drink, assorted flavours." },
  // coffee
  { slug: "hot-coffee", name: "Hot Coffee", cat: "coffee", veg: true, price: 25, prep: 3, desc: "Frothy milk coffee." },
  { slug: "cappuccino", name: "Cappuccino", cat: "coffee", veg: true, price: 60, prep: 4, desc: "Espresso with steamed milk foam." },
  { slug: "cold-coffee", name: "Cold Coffee", cat: "coffee", veg: true, price: 60, prep: 4, desc: "Blended iced coffee with cream." },
  { slug: "iced-mocha", name: "Iced Mocha", cat: "coffee", veg: true, price: 80, prep: 5, desc: "Chocolate, espresso and chilled milk." },
  { slug: "filter-coffee", name: "Filter Coffee", cat: "coffee", veg: true, price: 25, prep: 3, desc: "South Indian decoction coffee in a davara." },
  // breakfast
  { slug: "poha", name: "Poha", cat: "breakfast", veg: true, price: 30, prep: 5, desc: "Flattened rice with peanuts and lemon." },
  { slug: "aloo-paratha", name: "Aloo Paratha with Curd", cat: "breakfast", veg: true, price: 50, prep: 10, desc: "Two stuffed parathas, butter, curd, pickle." },
  { slug: "masala-dosa", name: "Masala Dosa", cat: "breakfast", veg: true, price: 55, prep: 9, desc: "Crisp dosa, potato masala, sambar, chutney." },
  { slug: "idli", name: "Idli Sambar (3 pcs)", cat: "breakfast", veg: true, price: 40, prep: 5, desc: "Steamed rice cakes with sambar and chutney." },
  { slug: "bread-omelette", name: "Bread Omelette", cat: "breakfast", veg: false, price: 40, prep: 6, desc: "Masala omelette sandwiched in toasted bread." },
  // lunch
  { slug: "rajma-chawal", name: "Rajma Chawal", cat: "lunch", veg: true, price: 70, prep: 8, desc: "Kidney bean curry with jeera rice." },
  { slug: "chole-bhature", name: "Chole Bhature", cat: "lunch", veg: true, price: 70, prep: 10, desc: "Spicy chickpeas with two fluffy bhature.", image: categoryImage.snacks },
  { slug: "fried-rice", name: "Veg Fried Rice", cat: "lunch", veg: true, price: 70, prep: 10, desc: "Wok-tossed rice with vegetables." },
  { slug: "egg-curry-rice", name: "Egg Curry Rice", cat: "lunch", veg: false, price: 80, prep: 8, desc: "Two-egg curry served with steamed rice." },
  // dinner
  { slug: "paneer-butter", name: "Paneer Butter Masala + 2 Roti", cat: "dinner", veg: true, price: 110, prep: 12, desc: "Creamy tomato gravy with soft paneer.", image: categoryImage.meals },
  { slug: "chicken-biryani", name: "Chicken Biryani", cat: "dinner", veg: false, price: 140, prep: 15, desc: "Dum-style biryani with raita." },
  { slug: "veg-biryani", name: "Veg Biryani", cat: "dinner", veg: true, price: 100, prep: 12, desc: "Fragrant basmati with mixed vegetables." },
  { slug: "butter-chicken", name: "Butter Chicken + 2 Roti", cat: "dinner", veg: false, price: 150, prep: 15, desc: "Smoky chicken in buttery makhani gravy." },
  // full meals
  { slug: "veg-thali", name: "Veg Thali", cat: "meals", veg: true, price: 90, prep: 8, desc: "Dal, sabzi, rice, 3 roti, salad, sweet." },
  { slug: "special-thali", name: "Special Thali", cat: "meals", veg: true, price: 130, prep: 10, desc: "Paneer, dal makhani, pulao, roti, raita, sweet." },
  { slug: "nonveg-thali", name: "Non-Veg Thali", cat: "meals", veg: false, price: 150, prep: 12, desc: "Chicken curry, dal, rice, roti, salad." },
  { slug: "south-meals", name: "South Indian Meals", cat: "meals", veg: true, price: 100, prep: 8, desc: "Rice, sambar, rasam, poriyal, curd, papad.", image: images.food.breakfast },
];

const fullWeek = (open: string, close: string, sundayClosed = false): OpeningHour[] =>
  (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const).map((day) => ({
    day,
    open,
    close,
    closed: sundayClosed && day === "Sun",
  }));

type CanteenSpec = Omit<Canteen, "openingHours" | "isDemo" | "acceptingOrders" | "phone"> & {
  cats: string[];
  hours: [string, string, boolean?];
};

const hostelCats = ["noodles", "snacks", "sandwiches", "beverages", "coffee", "chips", "chocolates", "candies", "breakfast"];

const hostel = (letter: string, i: number, extra: Partial<CanteenSpec> = {}): CanteenSpec => ({
  id: `hostel-${letter.toLowerCase()}`,
  name: `Hostel ${letter} Canteen`,
  code: `H${letter}`,
  tagline: "Late-night Maggi, chai and quick bites",
  description: `The go-to night canteen for Hostel ${letter} residents — Maggi, sandwiches, chai and snacks until late. Demo outlet with placeholder menu and timings.`,
  cuisine: ["Maggi", "Snacks", "Chai"],
  location: `Ground floor, Hostel ${letter}`,
  image: images.canteens[i % 3],
  rating: 4.0 + ((i * 7) % 8) / 10,
  ratingCount: 80 + i * 23,
  prepTime: 8 + (i % 4) * 2,
  isOpen: true,
  featured: false,
  cats: hostelCats,
  hours: ["18:00", "02:00"],
  ...extra,
});

const specs: CanteenSpec[] = [
  {
    id: "nescafe",
    name: "Nescafe",
    code: "NC",
    tagline: "Coffee, cold brews and quick bites",
    description: "The campus coffee kiosk for between-lecture caffeine, cold coffee and grilled sandwiches. Demo outlet with placeholder menu and timings.",
    cuisine: ["Coffee", "Beverages", "Sandwiches"],
    location: "Near Central Library",
    image: images.canteens[1],
    rating: 4.6,
    ratingCount: 512,
    prepTime: 6,
    isOpen: true,
    featured: true,
    cats: ["coffee", "beverages", "sandwiches", "noodles", "snacks", "chocolates", "chips"],
    hours: ["08:00", "23:00"],
  },
  {
    id: "annapurna",
    name: "Annapurna",
    code: "AN",
    tagline: "Home-style North Indian meals",
    description: "Hearty thalis, rajma chawal and paratha breakfasts — the main mess-style canteen. Demo outlet with placeholder menu and timings.",
    cuisine: ["North Indian", "Thali", "Breakfast"],
    location: "Academic Block, Gate 2",
    image: images.canteens[0],
    rating: 4.4,
    ratingCount: 864,
    prepTime: 12,
    isOpen: true,
    featured: true,
    cats: ["breakfast", "lunch", "dinner", "meals", "beverages", "snacks"],
    hours: ["07:30", "22:00"],
  },
  hostel("A", 0, { featured: true }),
  hostel("C", 1),
  hostel("E", 2),
  hostel("F", 3, { cats: [...hostelCats, "burgers"] }),
  hostel("G", 4),
  hostel("H", 5, { isOpen: false }),
  hostel("I", 6),
  hostel("J", 7, { cats: [...hostelCats, "lunch"] }),
  hostel("K", 8, { isOpen: false }),
  {
    id: "amba",
    name: "Amba",
    code: "AM",
    tagline: "Biryani, thalis and dinner specials",
    description: "Known for biryani nights and generous non-veg thalis. Demo outlet with placeholder menu and timings.",
    cuisine: ["Biryani", "Mughlai", "Thali"],
    location: "Near Sports Complex",
    image: images.canteens[2],
    rating: 4.5,
    ratingCount: 640,
    prepTime: 15,
    isOpen: true,
    featured: true,
    cats: ["lunch", "dinner", "meals", "beverages"],
    hours: ["11:30", "23:00"],
  },
  {
    id: "lhc",
    name: "LHC Canteen",
    code: "LH",
    tagline: "Grab-and-go between lectures",
    description: "Right next to the Lecture Hall Complex — burgers, sandwiches and chai for the 10-minute break. Demo outlet with placeholder menu and timings.",
    cuisine: ["Fast food", "Burgers", "Chai"],
    location: "Lecture Hall Complex",
    image: images.canteens[0],
    rating: 4.2,
    ratingCount: 455,
    prepTime: 7,
    isOpen: true,
    featured: true,
    cats: ["burgers", "sandwiches", "snacks", "beverages", "coffee", "chips", "chocolates", "candies"],
    hours: ["08:00", "18:00", true],
  },
  {
    id: "surya",
    name: "Surya",
    code: "SU",
    tagline: "South Indian tiffin and meals",
    description: "Crispy dosas, idli, filter coffee and banana-leaf style meals. Demo outlet with placeholder menu and timings.",
    cuisine: ["South Indian", "Tiffin", "Filter coffee"],
    location: "Opposite Main Auditorium",
    image: images.canteens[2],
    rating: 4.7,
    ratingCount: 702,
    prepTime: 10,
    isOpen: true,
    featured: true,
    cats: ["breakfast", "meals", "coffee", "beverages", "lunch"],
    hours: ["07:00", "21:30"],
  },
];

export const seedCanteens: Canteen[] = specs.map(({ cats: _cats, hours, ...c }, i) => ({
  ...c,
  rating: Math.round(c.rating * 10) / 10,
  acceptingOrders: c.isOpen,
  phone: `+91 98${String(76543210 + i * 1111).slice(0, 8)}`,
  openingHours: fullWeek(hours[0], hours[1], hours[2] ?? false),
  isDemo: true,
}));

// Deterministic pseudo-random so SSR and client seed data match.
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const seedFoods: FoodItem[] = specs.flatMap((spec, ci) =>
  T.filter((t) => spec.cats.includes(t.cat)).map((t) => {
    const h = hash(spec.id + t.slug);
    const bump = t.price >= 40 ? (ci % 3) * 5 : 0;
    return {
      id: `${spec.id}--${t.slug}`,
      canteenId: spec.id,
      name: t.name,
      description: t.desc,
      price: t.price + bump,
      categoryId: t.cat,
      isVeg: t.veg,
      image: t.image ?? categoryImage[t.cat],
      prepTime: t.prep,
      inStock: h % 13 !== 0,
      available: true,
      popular: h % 5 === 0,
      recommended: h % 7 === 1,
      rating: Math.round((3.8 + (h % 12) / 10) * 10) / 10,
    } satisfies FoodItem;
  }),
);

export const seedStudents: Student[] = [
  { id: "stu-1", name: "Aarav Sharma", email: "aarav@campus.edu", password: "demo1234", phone: "+91 98100 11223", rollNo: "22CS1042", hostel: "Hostel A", joinedAt: "2025-08-01T10:00:00.000Z", status: "active", favouriteFoods: ["nescafe--cold-coffee", "hostel-a--cheese-maggi"], favouriteCanteens: ["nescafe", "surya"] },
  { id: "stu-2", name: "Diya Patel", email: "diya@campus.edu", password: "demo1234", phone: "+91 98100 22334", rollNo: "23EE2011", hostel: "Hostel E", joinedAt: "2025-08-03T10:00:00.000Z", status: "active", favouriteFoods: [], favouriteCanteens: [] },
  { id: "stu-3", name: "Kabir Singh", email: "kabir@campus.edu", password: "demo1234", phone: "+91 98100 33445", rollNo: "21ME3050", hostel: "Hostel C", joinedAt: "2024-08-02T10:00:00.000Z", status: "active", favouriteFoods: [], favouriteCanteens: [] },
  { id: "stu-4", name: "Meera Iyer", email: "meera@campus.edu", password: "demo1234", phone: "+91 98100 44556", rollNo: "22BT1120", hostel: "Hostel G", joinedAt: "2025-01-12T10:00:00.000Z", status: "active", favouriteFoods: [], favouriteCanteens: [] },
  { id: "stu-5", name: "Rohan Verma", email: "rohan@campus.edu", password: "demo1234", phone: "+91 98100 55667", rollNo: "24CH0009", hostel: "Hostel J", joinedAt: "2026-08-05T10:00:00.000Z", status: "suspended", favouriteFoods: [], favouriteCanteens: [] },
  { id: "stu-6", name: "Ananya Rao", email: "ananya@campus.edu", password: "demo1234", phone: "+91 98100 66778", rollNo: "23CS1188", hostel: "Hostel F", joinedAt: "2025-08-04T10:00:00.000Z", status: "active", favouriteFoods: [], favouriteCanteens: [] },
];

type SeedOrderSpec = {
  n: number;
  user: string;
  canteen: string;
  items: [string, number][];
  status: OrderStatus;
  minsAgo: number;
};

const orderSpecs: SeedOrderSpec[] = [
  { n: 1, user: "stu-2", canteen: "nescafe", items: [["cold-coffee", 2], ["veg-grill", 1]], status: "placed", minsAgo: 2 },
  { n: 2, user: "stu-3", canteen: "nescafe", items: [["cappuccino", 1], ["samosa", 1]], status: "placed", minsAgo: 4 },
  { n: 3, user: "stu-4", canteen: "nescafe", items: [["cheese-maggi", 1], ["chai", 2]], status: "accepted", minsAgo: 7 },
  { n: 4, user: "stu-6", canteen: "nescafe", items: [["cheese-corn", 2]], status: "preparing", minsAgo: 11 },
  { n: 5, user: "stu-2", canteen: "nescafe", items: [["iced-mocha", 1]], status: "ready", minsAgo: 15 },
  { n: 6, user: "stu-3", canteen: "nescafe", items: [["hot-coffee", 3], ["veg-puff", 2]], status: "collected", minsAgo: 95 },
  { n: 7, user: "stu-1", canteen: "surya", items: [["masala-dosa", 1], ["filter-coffee", 1]], status: "preparing", minsAgo: 6 },
  { n: 8, user: "stu-1", canteen: "nescafe", items: [["cold-coffee", 1], ["cheese-corn", 1]], status: "collected", minsAgo: 60 * 26 },
  { n: 9, user: "stu-1", canteen: "hostel-a", items: [["cheese-maggi", 2], ["chai", 2]], status: "collected", minsAgo: 60 * 50 },
  { n: 10, user: "stu-1", canteen: "amba", items: [["chicken-biryani", 1], ["lassi", 1]], status: "cancelled", minsAgo: 60 * 75 },
  { n: 11, user: "stu-4", canteen: "annapurna", items: [["veg-thali", 2]], status: "accepted", minsAgo: 5 },
  { n: 12, user: "stu-6", canteen: "lhc", items: [["aloo-tikki-burger", 2], ["cold-drink", 2]], status: "collected", minsAgo: 180 },
  { n: 13, user: "stu-2", canteen: "amba", items: [["special-thali", 1]], status: "collected", minsAgo: 60 * 30 },
  { n: 14, user: "stu-3", canteen: "nescafe", items: [["lime-soda", 2]], status: "rejected", minsAgo: 140 },
];

const FLOW: OrderStatus[] = ["placed", "accepted", "preparing", "ready", "collected"];

export function buildSeedOrders(now = Date.now()): Order[] {
  return orderSpecs.map((s) => {
    const canteen = seedCanteens.find((c) => c.id === s.canteen)!;
    const student = seedStudents.find((u) => u.id === s.user)!;
    const lines = s.items.map(([slug, qty]) => {
      const f = seedFoods.find((x) => x.id === `${s.canteen}--${slug}`)!;
      return { foodId: f.id, name: f.name, price: f.price, qty, isVeg: f.isVeg };
    });
    const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
    const placed = now - s.minsAgo * 60_000;
    const reached =
      s.status === "cancelled" || s.status === "rejected"
        ? ["placed" as OrderStatus, s.status]
        : FLOW.slice(0, FLOW.indexOf(s.status) + 1);
    const prep = Math.max(...lines.map((l) => seedFoods.find((f) => f.id === l.foodId)!.prepTime)) + 3;
    return {
      id: `ord-seed-${s.n}`,
      orderNumber: `CN-${canteen.code}-${String(1000 + s.n * 37)}`,
      userId: s.user,
      studentName: student.name,
      canteenId: s.canteen,
      items: lines,
      subtotal,
      total: subtotal,
      status: s.status,
      prepMinutes: prep,
      pickupSlot: "asap",
      note: s.n === 1 ? "Less sugar in one coffee please" : "",
      paymentMethod: s.n % 2 ? "counter" : "upi",
      placedAt: new Date(placed).toISOString(),
      history: reached.map((st, i) => ({ status: st, at: new Date(placed + i * 3 * 60_000).toISOString() })),
      reason: s.status === "rejected" ? "Item ran out at the counter" : s.status === "cancelled" ? "Changed my plans" : undefined,
      reviewed: s.n === 8,
    } satisfies Order;
  });
}

export function buildSeedNotifications(now = Date.now()): AppNotification[] {
  return [
    { id: "ntf-1", userId: "stu-1", title: "Your dosa is being prepared", body: "Surya has started preparing order CN-SU-1259.", at: new Date(now - 3 * 60_000).toISOString(), read: false, orderId: "ord-seed-7", kind: "order" },
    { id: "ntf-2", userId: "stu-1", title: "Demo offer: Free chai Fridays", body: "Sample promotion — order any breakfast at Annapurna and get a chai on us (demo only).", at: new Date(now - 5 * 3600_000).toISOString(), read: false, kind: "offer" },
    { id: "ntf-3", userId: "stu-1", title: "Order collected", body: "Thanks for picking up CN-NC-1296 from Nescafe. Rate your food?", at: new Date(now - 26 * 3600_000).toISOString(), read: true, orderId: "ord-seed-8", kind: "order" },
    { id: "ntf-4", userId: "stu-1", title: "Welcome to Canteeno", body: "Order ahead, skip the queue, and pick up when your food is ready.", at: new Date(now - 72 * 3600_000).toISOString(), read: true, kind: "system" },
  ];
}

export function buildSeedReviews(now = Date.now()): Review[] {
  return [
    { id: "rev-1", userId: "stu-1", studentName: "Aarav Sharma", canteenId: "nescafe", orderId: "ord-seed-8", rating: 5, comment: "Cold coffee was ready before I reached the counter. Loved it!", at: new Date(now - 25 * 3600_000).toISOString(), status: "published", reply: "Thanks Aarav, see you soon!" },
    { id: "rev-2", userId: "stu-2", studentName: "Diya Patel", canteenId: "amba", orderId: "ord-seed-13", rating: 4, comment: "Great thali, slightly long wait at peak hours.", at: new Date(now - 29 * 3600_000).toISOString(), status: "published" },
    { id: "rev-3", userId: "stu-6", studentName: "Ananya Rao", canteenId: "lhc", orderId: "ord-seed-12", rating: 3, comment: "Burger was cold by the time the order was marked ready.", at: new Date(now - 2 * 3600_000).toISOString(), status: "flagged" },
    { id: "rev-4", userId: "stu-3", studentName: "Kabir Singh", canteenId: "nescafe", rating: 4, comment: "Cappuccino is consistently good. Wish they had oat milk.", at: new Date(now - 50 * 3600_000).toISOString(), status: "published" },
    { id: "rev-5", userId: "stu-4", studentName: "Meera Iyer", canteenId: "surya", rating: 5, comment: "Best dosa on campus, no contest.", at: new Date(now - 80 * 3600_000).toISOString(), status: "published" },
  ];
}

export const seedSettings: PlatformSettings = {
  platformName: "Canteeno",
  campusName: "Main Campus",
  orderingEnabled: true,
  maxActiveOrders: 3,
  pickupHoldMinutes: 20,
  supportEmail: "support@canteeno.demo",
  allowUpi: true,
};
