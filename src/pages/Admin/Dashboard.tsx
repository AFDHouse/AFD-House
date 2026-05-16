import { 
  TrendingUp, ShoppingCart, Users, DollarSign, 
  ArrowUpRight, Package, Truck, Clock, Eye,
  LayoutDashboard, ShoppingBag, BarChart3, ChevronRight,
  TrendingDown, PlusCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const quickStats = [
  { label: 'Total Sales', value: '৳1,24,500', change: '+12.5%', isUp: true, icon: DollarSign, color: 'indigo' },
  { label: 'Total Orders', value: '452', change: '+3.2%', isUp: true, icon: ShoppingCart, color: 'purple' },
  { label: 'Total Customers', value: '1,240', change: '-1.4%', isUp: false, icon: Users, color: 'fuchsia' },
  { label: 'Active Tasks', value: '18', change: '+2', isUp: true, icon: LayoutDashboard, color: 'blue' },
];

const chartData = [
  { name: 'Mon', revenue: 4000, orders: 120 },
  { name: 'Tue', revenue: 3000, orders: 98 },
  { name: 'Wed', revenue: 2000, orders: 86 },
  { name: 'Thu', revenue: 2780, orders: 110 },
  { name: 'Fri', revenue: 1890, orders: 75 },
  { name: 'Sat', revenue: 2390, orders: 95 },
  { name: 'Sun', revenue: 3490, orders: 130 },
];

const recentOrders = [
  { id: 'ORD-8821', customer: 'Anton Chakma', total: 4500, status: 'Processing', date: '2 mins ago' },
  { id: 'ORD-8820', customer: 'Sarah Ahmed', total: 2400, status: 'Shipped', date: '1 hour ago' },
  { id: 'ORD-8819', customer: 'Rahat Islam', total: 1200, status: 'Delivered', date: '3 hours ago' },
  { id: 'ORD-8818', customer: 'Nusrat Jahan', total: 3200, status: 'Cancelled', date: '5 hours ago' },
];

export default function DashboardOverview() {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    activeItems: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const productsSnap = await getDocs(collection(db, 'products'));
        const usersSnap = await getDocs(collection(db, 'users'));

        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const totalSales = orders.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0);
        
        setStats({
          totalSales,
          totalOrders: ordersSnap.size,
          totalCustomers: usersSnap.size,
          activeItems: productsSnap.size
        });

        // Get 4 most recent orders
        const recent = orders
          .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 4);
        setRecentOrders(recent);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const uiStats = [
    { label: 'Total Sales', value: `৳${stats.totalSales.toLocaleString()}`, change: '+12.5%', isUp: true, icon: DollarSign, color: 'indigo' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), change: '+3.2%', isUp: true, icon: ShoppingCart, color: 'purple' },
    { label: 'Total Customers', value: stats.totalCustomers.toString(), change: '-1.4%', isUp: false, icon: Users, color: 'fuchsia' },
    { label: 'Live Products', value: stats.activeItems.toString(), change: '+2', isUp: true, icon: ShoppingBag, color: 'blue' },
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
              Overview Dashboard
              <div className="hidden md:flex bg-primary/10 text-primary text-[10px] uppercase font-black px-3 py-1 rounded-full border border-primary/20 tracking-widest">
                 Live Feed
              </div>
           </h1>
           <p className="text-slate-400 font-bold mt-1 text-sm uppercase tracking-widest">Welcome back, AFD Administrative Center.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm text-xs font-bold text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4" />
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
           </div>
           <Link 
             to="/admin/products"
             className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 transition-all hover:translate-y-[-2px] active:scale-95"
           >
              <PlusCircle className="w-5 h-5" />
              New Listing
           </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {uiStats.map((stat, i) => (
          <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-primary transition-all relative overflow-hidden">
             <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex items-center justify-between">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6",
                     stat.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                     stat.color === 'purple' ? "bg-purple-50 text-purple-600" :
                     stat.color === 'fuchsia' ? "bg-fuchsia-50 text-fuchsia-600" :
                     "bg-blue-50 text-blue-600"
                   )}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                   <div className={cn(
                     "flex items-center gap-1 text-[11px] font-black tracking-tight",
                     stat.isUp ? "text-green-500" : "text-red-400"
                   )}>
                      {stat.isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {stat.change}
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                </div>
             </div>
             <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-slate-50 rounded-full group-hover:bg-primary/5 transition-colors" />
          </div>
        ))}
      </div>

      {/* Main Visuals Selection */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Chart Section */}
         <div className="xl:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Revenue Analytics</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Growth Forecast & Performance</p>
               </div>
               <div className="flex gap-2">
                  <button className="px-5 py-2 text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 uppercase tracking-widest transition-all">Weekly</button>
                  <button className="px-5 py-2 text-[10px] font-black text-white bg-slate-900 rounded-xl uppercase tracking-widest transition-all">Monthly</button>
               </div>
            </div>

            <div className="h-[400px] w-full min-h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fontWeight: 700, fill: theme === 'dark' ? '#64748b' : '#94a3b8'}} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fontWeight: 700, fill: theme === 'dark' ? '#64748b' : '#94a3b8'}} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#000'
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#000' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#6366f1" 
                      strokeWidth={5} 
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Sidebar Content: Recent Orders */}
         <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 h-full flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">Recent Activity</h3>
                  <Link to="/admin/orders" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white">
                     <Eye className="w-4 h-4" />
                  </Link>
               </div>

               <div className="flex-grow space-y-6">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full py-10">
                      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    </div>
                  ) : recentOrders.length > 0 ? (
                    recentOrders.map((order, i) => (
                      <div key={i} className="flex items-center gap-4 group/item">
                         <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover/item:bg-white group-hover/item:scale-105 group-hover/item:rotate-3">
                            <Package className="w-6 h-6 text-indigo-400 group-hover/item:text-indigo-600" />
                         </div>
                         <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between">
                               <p className="text-sm font-extrabold text-white truncate pr-2">{order.customerInfo?.fullName || 'Anonymous'}</p>
                               <p className="text-indigo-400 text-xs font-black shrink-0">৳{order.total}</p>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                               <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{order.id.slice(-6).toUpperCase()}</p>
                               <span className={cn(
                                 "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                                 order.status === 'processing' ? 'bg-yellow-400/20 text-yellow-400' :
                                 order.status === 'shipped' ? 'bg-blue-400/20 text-blue-400' :
                                 order.status === 'delivered' ? 'bg-green-400/20 text-green-400' :
                                 'bg-red-400/20 text-red-400'
                               )}>
                                 {order.status}
                               </span>
                            </div>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-white/20 text-xs font-bold font-mono">NO RECENT DATA</p>
                    </div>
                  )}
               </div>

               <div className="mt-10 pt-8 border-t border-white/10">
                  <div className="flex items-center justify-between text-white/60 mb-5">
                     <p className="text-[10px] font-black uppercase tracking-widest">Platform Flow</p>
                     <p className="text-[10px] font-black uppercase">Live Status</p>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                     <div className="h-full bg-indigo-600 rounded-full" style={{ width: '100%' }} />
                  </div>
               </div>
            </div>
            
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
         </div>
      </div>
    </div>
  );
}

// Add these missing imports at top
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Loader2 } from 'lucide-react';
