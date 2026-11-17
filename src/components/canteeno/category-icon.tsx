import {
  Beef,
  CakeSlice,
  Candy,
  ChefHat,
  Coffee,
  Cookie,
  CupSoda,
  EggFried,
  Pizza,
  Popcorn,
  Salad,
  Sandwich,
  Soup,
  UtensilsCrossed,
  IceCreamCone,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "candy-bar": CakeSlice,
  candy: Candy,
  popcorn: Popcorn,
  cookie: Cookie,
  soup: Soup,
  sandwich: Sandwich,
  beef: Beef,
  "cup-soda": CupSoda,
  coffee: Coffee,
  "egg-fried": EggFried,
  salad: Salad,
  "utensils-crossed": UtensilsCrossed,
  "chef-hat": ChefHat,
  pizza: Pizza,
  "ice-cream": IceCreamCone,
};

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = CATEGORY_ICONS[icon] ?? UtensilsCrossed;
  return <Icon className={className} aria-hidden />;
}
