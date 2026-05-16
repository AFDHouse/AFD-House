import { Product } from '../../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
  loading?: boolean;
}

export default function ProductGrid({ products, title, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-4">
            <div className="aspect-[3/4] bg-gray-200 rounded-2xl" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No products found.
        </div>
      )}
    </div>
  );
}
