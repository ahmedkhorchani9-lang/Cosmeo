export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock?: number;
  status?: string;
  image: string;
  description?: string;
  rating?: number;
  reviews?: number;
  bestSeller?: boolean;
}
