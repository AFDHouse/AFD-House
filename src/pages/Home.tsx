import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product } from '../types';
import ProductGrid from '../components/common/ProductGrid';
import { ChevronRight, ArrowRight, Truck, ShieldCheck, Clock, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const path = 'products';
      try {
        const q = query(collection(db, path), limit(10), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setFeaturedProducts(fetched);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    { name: "Men's Fashion", slug: 'men', image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=400&q=80' },
    { name: "Women's Fashion", slug: 'women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Kids Zone', slug: 'kids', image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* High Density Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-4">
        <div className="h-[180px] bg-gradient-to-r from-[#1e3a8a] to-[#581c87] rounded-xl flex items-center px-8 md:px-12 text-white shadow-sm overflow-hidden relative group">
          <div className="relative z-10 space-y-2">
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none"
            >
              EID GRAND SALE
            </motion.h1>
            <motion.p 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-base opacity-80 max-w-md"
            >
              Up to 60% Off on Latest Collections. Exclusive AFD House Styles.
            </motion.p>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="pt-2"
            >
              <Link to="/category/men" className="inline-block bg-white text-[#1e3a8a] px-6 py-2 rounded-md font-bold text-sm hover:bg-slate-100 transition-colors">
                Shop Now
              </Link>
            </motion.div>
          </div>
          {/* Decorative element */}
          <div className="absolute right-0 top-0 w-1/3 h-full bg-white/5 skew-x-[-20deg] translate-x-12 group-hover:translate-x-8 transition-transform duration-700" />
        </div>
      </section>

      {/* Main Layout Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-6 pt-2">
        {/* Compact Sidebar (Optional on Home, but useful for 'Density' look) */}
        <aside className="hidden lg:flex flex-col w-[200px] shrink-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-4">Quick Filters</h3>
            <div className="space-y-3">
              {categories.map(cat => (
                <label key={cat.slug} className="flex items-center text-xs font-medium text-slate-600 hover:text-primary cursor-pointer group">
                  <input type="checkbox" className="mr-2 h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary" />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-4">Price Range</h3>
            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <p>Min: ৳500</p>
              <p>Max: ৳5000</p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          {/* Features Strip - More compact */}
          <section className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm mb-6 overflow-x-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-w-[600px]">
              <div className="flex items-center space-x-3 px-4 py-1 border-r border-slate-100 last:border-0 text-center md:text-left">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">Fast Delivery</p>
                  <p className="text-[10px] text-slate-400 leading-tight">Around BD</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 px-4 py-1 border-r border-slate-100 last:border-0 text-center md:text-left">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">Genuine Items</p>
                  <p className="text-[10px] text-slate-400 leading-tight">100% Quality</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 px-4 py-1 border-r border-slate-100 last:border-0 text-center md:text-left">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">24/7 Support</p>
                  <p className="text-[10px] text-slate-400 leading-tight">Always Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 px-4 py-1 border-r border-slate-100 last:border-0 text-center md:text-left">
                <CreditCard className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">COD Available</p>
                  <p className="text-[10px] text-slate-400 leading-tight">Secure Pay</p>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Products Group */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Trending Now</h2>
              <Link to="/category/all" className="text-xs font-bold text-primary flex items-center hover:underline">
                View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
            <ProductGrid products={featuredProducts} loading={loading} />
          </section>

          {/* Brand CTA - More integrated */}
          <section className="mt-8">
            <div className="bg-slate-900 rounded-xl p-8 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-4">
                <h2 className="text-xl font-bold">Join the AFD Fashion Family</h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-sm mx-auto">
                  <input 
                    type="email" 
                    placeholder="Enter email" 
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-xs placeholder-slate-400 outline-none focus:bg-white/20"
                  />
                  <button className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-md font-bold text-xs hover:bg-blue-700">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
