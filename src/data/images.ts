import hero from "@/assets/hero-spread.jpg";
import canteen1 from "@/assets/canteen-1.jpg";
import canteen2 from "@/assets/canteen-2.jpg";
import canteen3 from "@/assets/canteen-3.jpg";
import maggi from "@/assets/food-maggi.jpg";
import sandwich from "@/assets/food-sandwich.jpg";
import burger from "@/assets/food-burger.jpg";
import coffee from "@/assets/food-coffee.jpg";
import thali from "@/assets/food-thali.jpg";
import biryani from "@/assets/food-biryani.jpg";
import breakfast from "@/assets/food-breakfast.jpg";
import snacks from "@/assets/food-snacks.jpg";
import chocolate from "@/assets/food-chocolate.jpg";
import candies from "@/assets/food-candies.jpg";
import chips from "@/assets/food-chips.jpg";
import beverages from "@/assets/food-beverages.jpg";
import lunch from "@/assets/food-lunch.jpg";

export const images = {
  hero,
  canteens: [canteen1, canteen2, canteen3],
  food: {
    maggi,
    sandwich,
    burger,
    coffee,
    thali,
    biryani,
    breakfast,
    snacks,
    chocolate,
    candies,
    chips,
    beverages,
    lunch,
  },
};

export const categoryImage: Record<string, string> = {
  chocolates: chocolate,
  candies,
  chips,
  snacks,
  noodles: maggi,
  sandwiches: sandwich,
  burgers: burger,
  beverages,
  coffee,
  breakfast,
  lunch,
  dinner: biryani,
  meals: thali,
};

export const fallbackFoodImage = thali;
