import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { Search, Eye, Filter, CheckCircle2, Truck, Clock, XCircle, MoreVertical, ShoppingCart, Users, Package } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

export default function OrdersManager() {
  const { theme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-50 text-green-600 border-green-100';
      case 'shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'processing': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
             <ShoppingCart className="w-8 h-8 text-primary" />
             Order Fulfillment
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Monitor, verify and update status for all customer transactions.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all dark:text-white">
          <Filter className="w-4 h-4" />
          Filter Stream
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Orders List */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-3d overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/30">
             <div className="relative w-full max-w-sm group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="ID, Customer, or City..." 
                  className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all dark:text-white" 
                />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-8 py-5 font-black">Order Ref</th>
                  <th className="px-8 py-5 font-black">Client Details</th>
                  <th className="px-8 py-5 font-black">Timestamp</th>
                  <th className="px-8 py-5 font-black">Status</th>
                  <th className="px-8 py-5 font-black text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {orders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className={cn(
                      "hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-all cursor-pointer group",
                      selectedOrder?.id === order.id ? "bg-indigo-50/50 dark:bg-indigo-900/30" : ""
                    )}
                  >
                    <td className="px-8 py-6">
                      <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">{order.customerInfo.fullName}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{order.customerInfo.city}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                        {order.createdAt ? format(order.createdAt.toDate(), 'dd MMM, HH:mm') : 'Recently'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                        theme === 'dark' 
                          ? getStatusStyle(order.status).replace('bg-', 'bg-').replace('text-', 'text-').replace('border-', 'border-').replace('50', '950/30').replace('100', '500/20')
                          : getStatusStyle(order.status)
                      )}>
                        {order.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900 dark:text-white tracking-tighter">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Panel */}
        <div className="xl:col-span-4 sticky top-24">
          <div className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl p-8 space-y-8 overflow-hidden relative">
            {selectedOrder ? (
              <>
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-black tracking-tighter">Order Intelligence</h3>
                     <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Eye className="w-5 h-5 text-indigo-400" />
                     </div>
                  </div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">ID: {selectedOrder.id.toUpperCase()}</p>
                </div>

                <div className="relative z-10 space-y-8">
                  {/* Status */}
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Fulfillment State</h4>
                     <div className="grid grid-cols-2 gap-2">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                          <button 
                            key={s}
                            onClick={() => updateStatus(selectedOrder.id, s)}
                            className={cn(
                              "py-2.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                              selectedOrder.status === s ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-white/5 text-white/40 hover:bg-white/10"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* Customer Info */}
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                           <Users className="w-4 h-4 text-indigo-400" />
                        </div>
                        <h4 className="text-[10px] font-black text-white/60 uppercase tracking-widest">Shipping Logic</h4>
                     </div>
                     <div className="space-y-1">
                        <p className="text-lg font-black tracking-tight">{selectedOrder.customerInfo.fullName}</p>
                        <p className="text-sm font-bold text-white/60">{selectedOrder.customerInfo.phone}</p>
                        <p className="text-xs font-medium text-white/40 leading-relaxed italic">{selectedOrder.customerInfo.address}, {selectedOrder.customerInfo.city}</p>
                     </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Basket Contents ({selectedOrder.items.length})</h4>
                     <div className="space-y-4 max-h-[180px] overflow-y-auto custom-scrollbar-light pr-2">
                        {selectedOrder.items.map((item, i) => (
                           <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                              <div className="w-12 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10">
                                 <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-grow min-w-0">
                                 <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                                 <p className="text-[9px] font-black text-white/30 uppercase tracking-tighter mt-1">
                                    {item.selectedSize} / {item.selectedColor} • x{item.quantity}
                                 </p>
                              </div>
                              <div className="text-xs font-black text-white tracking-widest">
                                 ৳{(item.discountPrice || item.price) * item.quantity}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                     <p className="text-[11px] font-black text-white/30 uppercase tracking-widest">Terminal Total</p>
                     <p className="text-3xl font-black text-indigo-400 tracking-tighter">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                </div>
                
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
              </>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-6">
                 <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-12">
                    <Package className="w-10 h-10 text-white/20" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-white text-lg font-black tracking-tight">Focus an Order</p>
                    <p className="text-white/30 text-xs font-bold leading-relaxed">Select a transaction from the list<br />to unlock shipping details and<br />advanced status controls.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
