import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { ShoppingBag, X, Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export default function Wishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'wishlist'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        
        // In a real app we might want to fetch full product details if we only store IDs
        // Here we assume the wishlist doc stores enough info
        setItems(fetchedItems.map(item => item.product));
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    try {
      // Find the wishlist doc with this productId and userId
      const q = query(
        collection(db, 'wishlist'), 
        where('userId', '==', user.uid),
        where('product.id', '==', productId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async (document) => {
        await deleteDoc(doc(db, 'wishlist', document.id));
      });
      setItems(prev => prev.filter(item => item.id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(
      product,
      1,
      product.sizes?.[0] || '',
      product.colors?.[0] || ''
    );
    removeFromWishlist(product.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Wishlist</h2>
          <p className="text-slate-500 text-sm font-medium">Items you've saved for later</p>
        </div>
        <Link to="/" className="flex items-center text-sm font-bold text-blue-600 hover:gap-1 transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium">Loading your items...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-slate-200" />
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">Your wishlist is empty</h3>
           <p className="text-slate-500 mb-8 max-w-sm mx-auto">See something you like? Tap the heart icon on any product to save it here.</p>
           <Link to="/" className="inline-block px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all">Explore Collections</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <div key={product.id} className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500">
              <div className="aspect-[4/5] relative overflow-hidden">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <button 
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 shadow-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{product.category}</p>
                  <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                  <p className="text-lg font-black text-slate-900 mt-1">{formatCurrency(product.price)}</p>
                </div>
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all group-hover:bg-blue-600"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
