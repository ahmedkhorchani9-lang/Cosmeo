import { Link } from 'react-router';
import { Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link 
      to={`/product/${product.id}`}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-secondary aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock === 0 ? (
          <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
            Out of Stock
          </span>
        ) : product.bestSeller && (
          <span className="absolute top-4 right-4 bg-primary text-white text-xs px-3 py-1.5 rounded-full">
            Best Seller
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {product.category}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="text-sm">{product.rating}</span>
          </div>
        </div>

        <h3 className="text-lg mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <p className="text-xl text-primary">
          {product.price.toFixed(2)} DT
        </p>
      </div>
    </Link>
  );
};
