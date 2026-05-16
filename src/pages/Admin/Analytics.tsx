import { 
  BarChart3, TrendingUp, TrendingDown, Target, 
  MousePointer2, ShoppingCart, DollarSign, Users,
  Activity, Globe, ArrowUpRight, ArrowDownRight,
  MoreVertical, Calendar
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { cn } from '../../lib/utils';

const salesData = [
  { name: 'Mon', revenue: 4500, orders: 120 },
  { name: 'Tue', revenue: 5200, orders: 156 },
  { name: 'Wed', revenue: 4800, orders: 142 },
  { name: 'Thu', revenue: 6100, orders: 180 },
  { name: 'Fri', revenue: 5500, orders: 165 },
  { name: 'Sat', revenue: 7200, orders: 210 },
  { name: 'Sun', revenue: 6800, orders: 195 },
];

const categoryData = [
  { name: 'T-Shirts', value: 45, color: '#6366f1' },
  { name: 'Jeans', value: 25, color: '#a855f7' },
  { name: 'Sneakers', value: 20, color: '#ec4899' },
  { name: 'Jackets', value: 10, color: '#10b981' },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                 <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financial Analytics</h1>
           </div>
           <p className="text-sm text-slate-500 font-medium mt-1">Deep dive into sales performance, traffic sources, and conversion metrics.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all">
              <Calendar className="w-4 h-4" />
              Last 30 Days
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95">
              Generate Report
           </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricCard 
           title="Total Revenue" 
           value="৳850,240" 
           trend="+14.2%" 
           trendUp={true} 
           icon={DollarSign}
           chartType="area"
         />
         <MetricCard 
           title="Order Volume" 
           value="1,248" 
           trend="+5.6%" 
           trendUp={true} 
           icon={ShoppingCart}
           chartType="bar"
         />
         <MetricCard 
           title="Conversion Rate" 
           value="3.42%" 
           trend="-1.2%" 
           trendUp={false} 
           icon={Target}
           chartType="area"
         />
         <MetricCard 
           title="Avg. Session" 
           value="4m 32s" 
           trend="+22.1%" 
           trendUp={true} 
           icon={Activity}
           chartType="bar"
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Chart */}
         <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-3d space-y-8">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Revenue Dynamics</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Weekly Performance Overview</p>
               </div>
               <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-lg">
                     <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                     <span className="text-[10px] font-black text-indigo-600">Revenue</span>
                  </div>
               </div>
            </div>
            
            <div className="h-[350px] w-full min-h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                       dy={10} 
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                     />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}
                       itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                     />
                     <Area 
                       type="monotone" 
                       dataKey="revenue" 
                       stroke="#6366f1" 
                       strokeWidth={4} 
                       fillOpacity={1} 
                       fill="url(#revenueGradient)" 
                       animationDuration={2000}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Right Sidebar Charts */}
         <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-3d text-center space-y-6">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Category Distribution</h3>
               <div className="h-64 min-h-[256px] w-full flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={categoryData}
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={8}
                           dataKey="value"
                        >
                           {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-3 text-left">
                  {categoryData.map(cat => (
                    <div key={cat.name} className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                       <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{cat.name} ({cat.value}%)</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-gradient-premium p-8 rounded-3xl border border-white/10 shadow-3d text-white relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                     <Globe className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="text-xl font-extrabold tracking-tight">Real-time Traffic</h4>
                     <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Global Visitors Now</p>
                  </div>
                  <div className="text-5xl font-black tabular-nums">42</div>
                  <div className="flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
                     <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                     Live Tracking
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            </div>
         </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, trendUp, icon: Icon }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-3d relative overflow-hidden group hover:border-primary/20 transition-all">
       <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-slate-50 group-hover:bg-primary/5 rounded-2xl flex items-center justify-center transition-colors">
             <Icon className="w-6 h-6 text-slate-400 group-hover:text-primary" />
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black",
            trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}>
             {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
             {trend}
          </div>
       </div>
       <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
       </div>
    </div>
  );
}
