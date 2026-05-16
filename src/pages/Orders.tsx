import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Order } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Package, ChevronRight, ArrowLeft, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'), 
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
        setOrders(fetched.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
          const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
          return timeB - timeA;
        }));
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'processing': return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />;
      case 'shipped': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'delivered': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Package className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Purchase History</h2>
          <p className="text-slate-500 text-sm font-medium">Keep track of your style journeys</p>
        </div>
        <Link to="/" className="flex items-center text-sm font-bold text-blue-600 hover:gap-1 transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-slate-200" />
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h3>
           <p className="text-slate-500 mb-8 max-w-sm mx-auto">Looks like you haven't placed any orders. Start browsing our latest collections today!</p>
           <Link to="/" className="inline-block px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-blue-100/30 transition-all group">
              <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                {/* Order Meta */}
                <div className="lg:w-64 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
                      <p className="font-bold text-slate-900">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                      <p className="text-sm font-bold text-slate-700">{format(order.createdAt?.toDate?.() || new Date(), 'dd MMM yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                      <p className="text-sm font-black text-blue-600">{formatCurrency(order.total)}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    order.status === 'delivered' ? "bg-green-50 text-green-600 border-green-100" :
                    order.status === 'cancelled' ? "bg-red-50 text-red-600 border-red-100" :
                    "bg-blue-50 text-blue-600 border-blue-100"
                  )}>
                    {order.status}
                  </div>
                </div>

                {/* Items Preview */}
                <div className="flex-grow flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="relative shrink-0 group/item">
                       <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-20 h-20 rounded-2xl object-cover border border-slate-100"
                       />
                       <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                         {item.quantity}
                       </span>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
                      +{order.items.length - 4} more
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="lg:w-48 flex flex-col gap-3">
                  <Link 
                    to={`/track-order?id=${order.id}`}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest uppercase text-center hover:bg-slate-800 transition-all flex items-center justify-center group"
                  >
                    Track Order
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button className="w-full py-3.5 bg-white border border-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
