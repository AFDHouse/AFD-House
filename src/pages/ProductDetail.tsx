import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { useCart } from '../hooks/useCart';
import { ShoppingBag, Heart, Share2, Truck, ShieldCheck, ChevronRight, Star } from 'lucide-react';
import ProductGrid from '../components/common/ProductGrid';
import { motion } from 'motion/react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const p = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(p);
          setSelectedSize(p.sizes[0] || '');
          setSelectedColor(p.colors[0] || '');
          
          // Related products
          const q = query(collection(db, 'products'), where('category', '==', p.category), limit(4));
          const relatedSnap = await getDocs(q);
          setRelatedProducts(relatedSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    setAdding(true);
    addToCart(product, quantity, selectedSize, selectedColor);
    setTimeout(() => {
      setAdding(false);
      navigate('/cart');
    }, 500);
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Loading product...</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center text-[11px] font-medium text-slate-400 space-x-2">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/category/${product.category}`} className="hover:text-primary transition-colors capitalize">{product.category}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900 font-bold truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={product.images[selectedImage] || `https://picsum.photos/seed/${product.id}/800/1200`}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  selectedImage === i ? "border-primary shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-3">
             <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="text-primary">{product.category}</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="flex items-center text-yellow-500">
                <Star className="w-3 h-3 fill-current mr-1" />
                <span>4.8 (120 reviews)</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{product.name}</h1>
            <div className="flex items-baseline space-x-3">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-primary">{formatCurrency(product.discountPrice)}</span>
                  <span className="text-sm text-slate-400 line-through">{formatCurrency(product.price)}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-slate-900">{formatCurrency(product.price)}</span>
              )}
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed text-sm">
            {product.description}
          </p>

          <div className="space-y-5 pt-2">
            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg border text-xs font-bold transition-all",
                        selectedColor === color ? "border-primary bg-primary text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Size</h3>
                  <button className="text-[10px] text-primary font-bold hover:underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "w-12 h-10 rounded-lg border text-xs font-bold transition-all flex items-center justify-center",
                        selectedSize === size ? "border-primary bg-primary text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-grow flex items-center justify-center space-x-2 py-3 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-primary transition-all shadow-sm active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{adding ? 'Adding...' : 'Add to Bag'}</span>
              </button>
              <button className="p-3 border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-95">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-[10px]">
              <Truck className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 font-medium">Free delivery over ৳2,000</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px]">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 font-medium">Secure SSL Payments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12">
          <ProductGrid title="You might also like" products={relatedProducts.filter(p => p.id !== product.id)} />
        </section>
      )}
    </div>
  );

}
