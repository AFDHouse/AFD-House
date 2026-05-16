import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product } from '../types';
import ProductGrid from '../components/common/ProductGrid';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [searchParams] = useSearchParams();
  const queryText = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const path = 'products';
      try {
        const q = query(collection(db, path));
        const snapshot = await getDocs(q);
        const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        // Simple client-side search for demo/MVP
        const filtered = allProducts.filter(p => 
          p.name.toLowerCase().includes(queryText.toLowerCase()) ||
          p.category.toLowerCase().includes(queryText.toLowerCase()) ||
          p.description.toLowerCase().includes(queryText.toLowerCase())
        );
        
        setProducts(filtered);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [queryText]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <SearchIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">Search Results</h1>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-0.5">
            {loading ? 'Searching...' : `Found ${products.length} results for "${queryText}"`}
          </p>
        </div>
      </div>

      <ProductGrid products={products} loading={loading} />
    </div>
  );
}
