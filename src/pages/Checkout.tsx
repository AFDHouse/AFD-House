import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { formatCurrency, cn } from '../lib/utils';
import { ShieldCheck, Truck, CreditCard, ChevronLeft } from 'lucide-react';

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: 'Dhaka',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const orderPath = 'orders';
    try {
      const order = {
        userId: user.uid,
        customerInfo: formData,
        items: cart,
        total: totalPrice,
        status: 'pending',
        paymentMethod: 'COD',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, orderPath), order);
      clearCart();
      navigate('/order-success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, orderPath);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <button 
        onClick={() => navigate('/cart')}
        className="flex items-center text-[11px] font-bold text-slate-400 hover:text-primary mb-6 transition-colors uppercase tracking-widest"
      >
        <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Back to Cart
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Checkout Information</h1>
            <p className="text-sm text-slate-500 font-medium">Shipping only available within Bangladesh (Cash on Delivery)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <input 
                required
                type="text" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
              <input 
                required
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">City</label>
                <select 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:border-primary outline-none appearance-none text-sm shadow-sm"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Area</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Uttara"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:border-primary outline-none text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Address</label>
              <textarea 
                required
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="House #, Road #, Block #"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:border-primary outline-none text-sm resize-none shadow-sm"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-3 shadow-xs">
              <div className="p-2 bg-white rounded-lg text-primary shadow-sm"><CreditCard className="w-5 h-5" /></div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Cash on Delivery</h3>
                <p className="text-[11px] text-slate-500 font-medium">Pay in cash when you receive your order at your doorstep.</p>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-primary transition-all shadow-md active:scale-95"
            >
              {loading ? 'Processing Order...' : `Confirm Order for ${formatCurrency(totalPrice)}`}
            </button>
          </form>
        </div>

        {/* Order Sticky Summary */}
        <div className="lg:pl-6">
          <div className="bg-slate-900 p-8 rounded-2xl text-white space-y-8 sticky top-24 shadow-xl">
             <h2 className="text-sm font-extrabold uppercase tracking-widest opacity-60">Your Selection</h2>
             
             <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
               {cart.map((item) => (
                 <div key={`${item.id}-${item.selectedSize}`} className="flex items-center space-x-3">
                    <div className="w-14 h-18 bg-white/10 rounded-lg overflow-hidden shrink-0 border border-white/5">
                      <img src={item.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-xs line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.selectedSize} | Qty: {item.quantity}</p>
                      <p className="text-xs font-bold text-primary mt-1">{formatCurrency((item.discountPrice || item.price) * item.quantity)}</p>
                    </div>
                 </div>
               ))}
             </div>

             <div className="border-t border-white/10 pt-6 space-y-3">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Shipping</span>
                  <span className="text-green-400 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold pt-3 border-t border-white/5">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(totalPrice)}</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-xl flex flex-col items-center text-center space-y-1.5 border border-white/5">
                   <Truck className="w-4 h-4 text-primary" />
                   <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-80">Fast Shipping</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl flex flex-col items-center text-center space-y-1.5 border border-white/5">
                   <ShieldCheck className="w-4 h-4 text-primary" />
                   <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-80">Payment Guard</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
