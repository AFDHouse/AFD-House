import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductGrid from '../components/common/ProductGrid';
import { Filter, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    price: 'all',
    size: 'all',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'products'), where('category', '==', slug));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(fetched);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug]);

  const filteredProducts = products.filter(p => {
    if (activeFilters.price === 'all') return true;
    if (activeFilters.price === '0-1000') return p.price <= 1000;
    if (activeFilters.price === '1000-2500') return p.price > 1000 && p.price <= 2500;
    if (activeFilters.price === '2500+') return p.price > 2500;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center text-[11px] font-medium text-slate-400 space-x-2">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronDown className="w-3 h-3 -rotate-90" />
          <span className="text-slate-900 font-bold capitalize">{slug}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 capitalize tracking-tight">{slug}'s Fashion</h1>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-primary transition-colors lg:hidden"
          >
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold">Filters</span>
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-[200px] space-y-8 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Price Range</h3>
            <div className="space-y-2">
              {['all', '0-1000', '1000-2500', '2500+'].map((range) => (
                <label key={range} className="flex items-center space-x-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="price" 
                    checked={activeFilters.price === range}
                    onChange={() => setActiveFilters({ ...activeFilters, price: range })}
                    className="w-3.5 h-3.5 text-primary border-slate-300 focus:ring-primary"
                  />
                  <span className={cn("text-xs transition-colors", activeFilters.price === range ? "text-primary font-bold" : "text-slate-600 group-hover:text-slate-900")}>
                    {range === 'all' ? 'All Prices' : range.includes('+') ? `Above ৳${range.replace('+', '')}` : `৳${range.replace('-', ' - ৳')}`}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Size</h3>
            <div className="grid grid-cols-3 gap-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button 
                  key={size}
                  className="py-1.5 text-[10px] font-bold border border-slate-200 rounded text-slate-600 hover:border-primary hover:text-primary transition-all"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow">
          <ProductGrid products={filteredProducts} loading={loading} />
        </div>
      </div>


      {/* Mobile Filter Overlay */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-80 bg-white z-[70] p-6 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              
              <div className="space-y-10">
                 <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Price Range</h3>
                  <div className="space-y-4">
                    {['all', '0-1000', '1000-2500', '2500+'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setActiveFilters({ ...activeFilters, price: range })}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                          activeFilters.price === range ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-600"
                        )}
                      >
                        {range === 'all' ? 'All Prices' : range.includes('+') ? `Above ৳${range.replace('+', '')}` : `৳${range.replace('-', ' - ৳')}`}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
