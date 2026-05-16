import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Shield, ShoppingBag, Package, LogOut, ChevronRight, User } from 'lucide-react';
import { format } from 'date-fns';

export default function Profile() {
  const { user, profile, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
        setOrders(fetched.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-20">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* User Card */}
        <div className="w-full md:w-80 space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-blue-100/50 text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-50 shadow-inner">
                    {user.displayName?.[0] || 'U'}
                </div>
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-900">{user.displayName || 'Fashionista'}</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                {profile?.role === 'admin' && (
                    <div className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        <Shield className="w-3 h-3" />
                        <span>Administrator</span>
                    </div>
                )}
                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{orders.length}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Orders</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">0</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rewards</p>
                    </div>
                </div>
            </div>

            <nav className="bg-white p-4 rounded-3xl border border-gray-100 space-y-1">
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-50 text-blue-600 group">
                    <div className="flex items-center space-x-3">
                        <ShoppingBag className="w-5 h-5" />
                        <span className="font-bold">My Orders</span>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 text-gray-600 group transition-colors">
                    <div className="flex items-center space-x-3">
                        <User className="w-5 h-5" />
                        <span className="font-bold">Security Settings</span>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center space-x-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 font-bold mt-4"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </nav>
        </div>

        {/* Orders List */}
        <div className="flex-grow space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Purchase History</h2>
                <div className="h-0.5 bg-gray-100 flex-grow mx-8" />
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400">Loading your orders...</div>
            ) : orders.length === 0 ? (
                <div className="bg-white p-12 rounded-[40px] border border-dashed border-gray-200 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto">
                        <Package className="w-8 h-8" />
                    </div>
                    <p className="text-gray-500 font-medium">You haven't made any purchases yet.</p>
                    <Link to="/" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-lg hover:shadow-blue-100/30 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Order ID: #{order.id.slice(-6).toUpperCase()}</p>
                                        <p className="font-bold text-gray-900">{format(order.createdAt?.toDate?.() || new Date(), 'dd MMM yyyy')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Amount</p>
                                        <p className="text-lg font-bold text-blue-600">{formatCurrency(order.total)}</p>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest",
                                        order.status === 'delivered' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                        {order.status}
                                    </div>
                                    <Link to={`/track-order?id=${order.id}`} className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
