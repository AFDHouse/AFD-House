import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-primary hover:shadow-lg transition-all duration-200 flex flex-col h-full relative p-3"
    >
      {/* Badge */}
      {discount && (
        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
          -{discount}%
        </div>
      )}

      {/* Image Area */}
      <Link to={`/product/${product.id}`} className="block h-[160px] bg-slate-100 rounded-lg overflow-hidden shrink-0 mb-3">
        <img
          src={product.images[0] || `https://picsum.photos/seed/${product.id}/400/600`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <Link to={`/product/${product.id}`} className="block mb-1">
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center space-x-1.5 mb-2">
          {product.discountPrice ? (
            <>
              <span className="text-base font-bold text-primary">{formatCurrency(product.discountPrice)}</span>
              <span className="text-[11px] text-slate-400 line-through">{formatCurrency(product.price)}</span>
            </>
          ) : (
            <span className="text-base font-bold text-primary">{formatCurrency(product.price)}</span>
          )}
        </div>

        {/* Rating & Bottom Row */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center text-yellow-500">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-[10px] ml-1 font-bold text-slate-600">4.8</span>
            <span className="text-[10px] ml-0.5 text-slate-400 font-medium">(128)</span>
          </div>
          <button className="p-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-primary hover:text-white transition-colors">
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
