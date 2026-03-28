export type CatalogItem = {
  name: string;
  price: number | null; // null means "Depends on Size" / Custom price
  category: string;
};

export const CATALOG: CatalogItem[] = [
  // Men Dry Cleaning
  { name: "T-shirt", price: 75, category: "Men Dry Cleaning" },
  { name: "Shirt", price: 75, category: "Men Dry Cleaning" },
  { name: "Silk Shirt", price: 100, category: "Men Dry Cleaning" },
  { name: "Woolen Shirt", price: 100, category: "Men Dry Cleaning" },
  { name: "Pants", price: 75, category: "Men Dry Cleaning" },
  { name: "Suit (2 Pcs - Blazer & Trouser)", price: 350, category: "Men Dry Cleaning" },
  { name: "Suit (3 Pcs - Blazer, Trouser & Shirt)", price: 350, category: "Men Dry Cleaning" },
  { name: "Kurta", price: 150, category: "Men Dry Cleaning" },
  { name: "Kurta Silk", price: 150, category: "Men Dry Cleaning" },
  { name: "Sherwani", price: 450, category: "Men Dry Cleaning" },
  { name: "Dhoti", price: 250, category: "Men Dry Cleaning" },
  { name: "Dhoti Silk", price: 300, category: "Men Dry Cleaning" },
  { name: "Safari Set", price: 300, category: "Men Dry Cleaning" },
  { name: "Achkan", price: 400, category: "Men Dry Cleaning" },
  { name: "Long Pullover", price: 200, category: "Men Dry Cleaning" },
  { name: "Blazer/Coat (Cotton)", price: 250, category: "Men Dry Cleaning" },
  { name: "Blazer/Coat (Miel/Woolen)", price: 350, category: "Men Dry Cleaning" },
  { name: "Long Coat", price: 350, category: "Men Dry Cleaning" },
  { name: "Jacket - Full Sleeves", price: 350, category: "Men Dry Cleaning" },
  { name: "Jacket - Half Sleeves", price: 250, category: "Men Dry Cleaning" },
  { name: "Jacket Leather", price: 500, category: "Men Dry Cleaning" },

  // Women Dry Cleaning
  { name: "Kurti/Karneez Plain", price: 75, category: "Women Dry Cleaning" },
  { name: "Kurti/Karneez Heavy", price: 150, category: "Women Dry Cleaning" },
  { name: "Salwar Plain", price: 90, category: "Women Dry Cleaning" },
  { name: "Salwar Heavy", price: 150, category: "Women Dry Cleaning" },
  { name: "Plazo Plain", price: 120, category: "Women Dry Cleaning" },
  { name: "Plazo with work", price: 160, category: "Women Dry Cleaning" },
  { name: "Dupatta", price: 60, category: "Women Dry Cleaning" },
  { name: "Dupatta with work", price: 135, category: "Women Dry Cleaning" },
  { name: "Saree", price: 250, category: "Women Dry Cleaning" },
  { name: "Saree with roll-press (D/C Polish)", price: 290, category: "Women Dry Cleaning" },
  { name: "Formal saree", price: 200, category: "Women Dry Cleaning" },
  { name: "Petticoat", price: 60, category: "Women Dry Cleaning" },
  { name: "Blouse", price: 50, category: "Women Dry Cleaning" },
  { name: "Blouse with work", price: 90, category: "Women Dry Cleaning" },
  { name: "Dress Plain", price: 180, category: "Women Dry Cleaning" },
  { name: "Dress Heavy", price: 350, category: "Women Dry Cleaning" },
  { name: "Dress Long Plain", price: 200, category: "Women Dry Cleaning" },
  { name: "Dress Long Heavy", price: 400, category: "Women Dry Cleaning" },
  { name: "Lehega", price: 500, category: "Women Dry Cleaning" },
  { name: "Lehega Heavy", price: 700, category: "Women Dry Cleaning" },
  { name: "Poshak set", price: 600, category: "Women Dry Cleaning" },
  { name: "Blanket (single)", price: 350, category: "Women Dry Cleaning" },

  // Household & Others
  { name: "Blanket (Double Bed)", price: 450, category: "Household & Others" },
  { name: "Sofa/Sheet", price: 350, category: "Household & Others" },
  { name: "Leather Shoes", price: 450, category: "Household & Others" },
  { name: "Sports Shoes", price: 250, category: "Household & Others" },
  { name: "Leather Bags", price: null, category: "Household & Others" },
  { name: "Normal Bags", price: null, category: "Household & Others" },
];

export const CATEGORIES = Array.from(new Set(CATALOG.map((i) => i.category)));
