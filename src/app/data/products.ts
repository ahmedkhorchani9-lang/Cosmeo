export interface Product {
  id: number;
  name: string;
  price: number;
  category: 'skincare' | 'makeup' | 'fragrance' | 'tools';
  image: string;
  description: string;
  rating: number;
  reviews: number;
  bestSeller?: boolean;
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Radiant Glow Serum",
    price: 68.00,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1638301868496-43577744a46c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBzZXJ1bSUyMGJvdHRsZXxlbnwxfHx8fDE3NzQ5NTU4NjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "A luxurious vitamin C serum that brightens and revitalizes your skin for a luminous, youthful glow.",
    rating: 4.8,
    reviews: 324,
    bestSeller: true,
    featured: true
  },
  {
    id: 2,
    name: "Velvet Rose Lipstick",
    price: 32.00,
    category: "makeup",
    image: "https://images.unsplash.com/photo-1770981773328-63c2ad10013d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtZXRpY3MlMjBsaXBzdGljayUyMGVsZWdhbnR8ZW58MXx8fHwxNzc0OTg1MTkyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Silky smooth formula with rich pigmentation and all-day wear. Available in 12 stunning shades.",
    rating: 4.9,
    reviews: 512,
    bestSeller: true,
    featured: true
  },
  {
    id: 3,
    name: "Hydrating Face Cream",
    price: 52.00,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1772191530787-b9546da02fbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNlJTIwY3JlYW0lMjBqYXIlMjBtaW5pbWFsaXN0fGVufDF8fHx8MTc3NDk4NTE5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Deep hydration meets luxury in this nourishing cream infused with botanical extracts and hyaluronic acid.",
    rating: 4.7,
    reviews: 298,
    bestSeller: true,
    featured: true
  },
  {
    id: 4,
    name: "Rose Petal Palette",
    price: 48.00,
    category: "makeup",
    image: "https://images.unsplash.com/photo-1625093525885-282384697917?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwbWFrZXVwJTIwcGFsZXR0ZSUyMGJlYXV0eXxlbnwxfHx8fDE3NzQ5ODUxOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "12 dreamy shades from soft pinks to rosy neutrals. Perfect for creating romantic, feminine looks.",
    rating: 4.9,
    reviews: 428,
    featured: true
  },
  {
    id: 5,
    name: "Professional Brush Set",
    price: 85.00,
    category: "tools",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBicnVzaCUyMHNldCUyMHBpbmt8ZW58MXx8fHwxNzc0OTg1MTkzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "10-piece luxury brush collection with ultra-soft synthetic bristles and elegant rose gold handles.",
    rating: 4.8,
    reviews: 187,
    bestSeller: true
  },
  {
    id: 6,
    name: "Bloom Eau de Parfum",
    price: 95.00,
    category: "fragrance",
    image: "https://images.unsplash.com/photo-1773527142304-58116364b8a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwYm90dGxlJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzQ5MDI0ODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "A delicate floral fragrance with notes of rose, jasmine, and vanilla. Elegant and unforgettable.",
    rating: 4.7,
    reviews: 256,
    featured: true
  },
  {
    id: 7,
    name: "Dewy Skin Essence",
    price: 58.00,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1768254636839-9a2d2619c861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBza2luY2FyZSUyMHByb2R1Y3QlMjBuYXR1cmFsJTIwbGlnaHR8ZW58MXx8fHwxNzc0OTg1MTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Lightweight essence that preps skin for a dewy, glass-like finish. Infused with botanical extracts.",
    rating: 4.6,
    reviews: 203
  },
  {
    id: 8,
    name: "Natural Glow Kit",
    price: 72.00,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1761864293818-603c23655cee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwYmVhdXR5JTIwcHJvZHVjdHN8ZW58MXx8fHwxNzc0OTAyNDg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Complete skincare set with cleanser, toner, and moisturizer. Perfect for achieving healthy, glowing skin.",
    rating: 4.8,
    reviews: 341,
    bestSeller: true
  },
  {
    id: 9,
    name: "Powder Blush Duo",
    price: 38.00,
    category: "makeup",
    image: "https://images.unsplash.com/photo-1764333746618-6285bf70db23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBibHVzaCUyMGNvbXBhY3QlMjBwb3dkZXJ8ZW58MXx8fHwxNzc0OTg1MTk1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Two complementary blush shades that blend seamlessly for a natural flush of color.",
    rating: 4.7,
    reviews: 289
  },
  {
    id: 10,
    name: "Skincare Ritual Set",
    price: 125.00,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1614159102349-eddb8b985aa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHJvdXRpbmUlMjBmbGF0bGF5fGVufDF8fHx8MTc3NDk4NTE5NXww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Complete morning and evening skincare routine featuring our best-selling products.",
    rating: 4.9,
    reviews: 456,
    featured: true,
    bestSeller: true
  }
];

export const getProductById = (id: number): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return products;
  return products.filter(product => product.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

export const getBestSellers = (): Product[] => {
  return products.filter(product => product.bestSeller);
};
