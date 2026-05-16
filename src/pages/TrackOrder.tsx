import { useState, FormEvent } from 'react';
import { collection, query, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Order } from '../types';
import { Search, Package, MapPin, Truck, CheckCircle2, ChevronRight, Clock, XCircle } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setError('');
    setOrder(null);

    const path = 'orders';
    try {
      // Allow searching by full ID or last 6 characters
      let foundOrder: Order | null = null;
      
      if (orderId.length > 10) {
          const docRef = doc(db, path, orderId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
              foundOrder = { id: docSnap.id, ...docSnap.data() } as Order;
          }
      } else {
           // This is a bit inefficient for large DBs but fine for now - in production you'd have a specific index
           const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(100));
           const querySnapshot = await getDocs(q);
           foundOrder = querySnapshot.docs
            .map(d => ({ id: d.id, ...d.data() } as Order))
            .find(o => o.id.slice(-6).toLowerCase() === orderId.toLowerCase()) || null;
      }

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('Order not found. Please check your Order ID.');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Pending', status: 'pending', icon: Clock },
    { label: 'Processing', status: 'processing', icon: Package },
    { label: 'Shipped', status: 'shipped', icon: Truck },
    { label: 'Delivered', status: 'delivered', icon: CheckCircle2 },
  ];

  const currentStep = steps.findIndex(s => s.status === order?.status);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Track Your Order</h1>
        <p className="text-sm text-slate-500 font-medium">Enter your Order ID from your confirmation email.</p>
      </div>

      <div className="max-w-xl mx-auto">
        <form onSubmit={handleTrack} className="flex gap-2">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Order ID (e.g. F4B231)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.replace('#', ''))}
              className="w-full pl-10 pr-6 py-3 bg-white border border-slate-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm text-sm"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-primary transition-all disabled:opacity-50 active:scale-95 shadow-sm"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
        {error && <p className="mt-3 text-center text-red-500 text-[11px] font-bold uppercase tracking-widest">{error}</p>}
      </div>

      <AnimatePresence mode="wait">
        {order && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Progress Tracker */}
            <div className="bg-white p-6 md:p-10 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
                  <div className="space-y-1">
                    <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">
                      Status: <span className="text-primary">{order.status}</span>
                    </h2>
                    <p className="text-lg font-extrabold text-slate-900 tracking-tight">Order #{order.id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Delivery</p>
                    <p className="font-bold text-slate-900">2 - 4 Business Days</p>
                  </div>
               </div>

               {order.status === 'cancelled' ? (
                   <div className="p-6 bg-red-50 rounded-lg border border-red-100 text-center flex flex-col items-center space-y-3">
                       <XCircle className="w-10 h-10 text-red-500" />
                       <h3 className="text-base font-bold text-red-900">This order has been cancelled.</h3>
                       <p className="text-[11px] text-red-700/70 max-w-sm">Please contact support@afdhouse.com for assistance.</p>
                   </div>
               ) : (
                <div className="relative pt-4 pb-2">
                    {/* Line */}
                    <div className="absolute top-[22px] left-0 w-full h-[2px] bg-slate-100 hidden md:block" />
                    <div 
                        className="absolute top-[22px] left-0 h-[2px] bg-primary transition-all duration-1000 hidden md:block" 
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />
                    
                    <div className="flex flex-col md:flex-row justify-between relative z-10 gap-6">
                        {steps.map((step, i) => {
                            const isCompleted = i <= currentStep;
                            const isActive = i === currentStep;
                            return (
                                <div key={step.label} className="flex md:flex-col items-center space-x-4 md:space-x-0 md:space-y-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500",
                                        isCompleted ? "bg-primary text-white shadow-sm" : "bg-white border border-slate-200 text-slate-300"
                                    )}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left md:text-center">
                                        <p className={cn(
                                          "text-[11px] font-bold transition-colors",
                                          isCompleted ? "text-slate-900" : "text-slate-400"
                                        )}>
                                          {step.label}
                                        </p>
                                        {isActive && <p className="text-[8px] text-primary font-extrabold uppercase tracking-widest mt-0.5">Current</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
               )}
            </div>

            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Customer Details</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                        <p className="text-slate-400 font-bold text-[10px]">Delivery Address</p>
                        <p className="text-slate-800 font-medium mt-1 leading-relaxed">
                            {order.customerInfo.fullName}<br />
                            {order.customerInfo.address}, {order.customerInfo.city}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold text-[10px]">Contact</p>
                        <p className="text-slate-800 font-medium mt-0.5">{order.customerInfo.phone}</p>
                    </div>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Order Totals</h3>
                  <div className="space-y-2.5 pt-1">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-500">Items Subtotal</span>
                        <span className="text-slate-900 font-bold">{formatCurrency(order.total)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-500">Shipping</span>
                        <span className="text-green-600 font-bold">FREE</span>
                    </div>
                    <div className="border-t border-slate-100 pt-2.5 flex justify-between text-sm font-extrabold">
                        <span className="text-slate-900">Paid by COD</span>
                        <span className="text-primary">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


