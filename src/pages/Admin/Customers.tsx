import { 
  Users, UserPlus, UserCheck, UserMinus, 
  Search, Mail, Phone, MapPin, MoreHorizontal, 
  Trash2, MailIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

const mockCustomers = [
  { id: '1', name: 'Anton Chakma', email: 'antonchakma6@gmail.com', phone: '+8801700000000', city: 'Dhaka', orders: 12, spent: 25400, status: 'active', avatar: 'https://ui-avatars.com/api/?name=Anton+Chakma&background=6366f1&color=fff' },
  { id: '2', name: 'Sarah Ahmed', email: 'sarah@example.com', phone: '+8801811111111', city: 'Chittagong', orders: 5, spent: 8900, status: 'active', avatar: 'https://ui-avatars.com/api/?name=Sarah+Ahmed&background=a855f7&color=fff' },
  { id: '3', name: 'Rahat Islam', email: 'rahat@domain.com', phone: '+8801922222222', city: 'Sylhet', orders: 2, spent: 3200, status: 'inactive', avatar: 'https://ui-avatars.com/api/?name=Rahat+Islam&background=ec4899&color=fff' },
  { id: '4', name: 'Nusrat Jahan', email: 'nusrat@web.com', phone: '+8801633333333', city: 'Khulna', orders: 0, spent: 0, status: 'new', avatar: 'https://ui-avatars.com/api/?name=Nusrat+Jahan&background=10b981&color=fff' },
];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <Users className="w-8 h-8 text-primary" />
             Customers Database
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage user accounts, purchase history, and engagement levels.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-slate-200 transition-all active:scale-95">
          <UserPlus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '1,284', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Now', value: '42', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'New This Month', value: '156', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Churned', value: '12', icon: UserMinus, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3d flex items-center gap-4">
             <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-extrabold text-slate-900">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search customers by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
               <button className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2">
                  Export CSV
               </button>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                <th className="px-8 py-5 font-black">Customer Profile</th>
                <th className="px-8 py-5 font-black">Location</th>
                <th className="px-8 py-5 font-black">Orders / Spent</th>
                <th className="px-8 py-5 font-black">Status</th>
                <th className="px-8 py-5 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-200 ring-2 ring-primary/5">
                          <img src={customer.avatar} alt="" className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-none">{customer.name}</h4>
                          <div className="flex items-center gap-2 mt-1.5">
                             <Mail className="w-3 h-3 text-slate-400" />
                             <span className="text-[11px] font-medium text-slate-500">{customer.email}</span>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <MapPin className="w-3.5 h-3.5 text-slate-400" />
                       <span className="text-xs font-bold text-slate-600">{customer.city}, BD</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 border border-slate-200">
                          {customer.orders} Orders
                       </div>
                       <span className="text-sm font-extrabold text-slate-900 tracking-tight">৳{customer.spent.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <span className={cn(
                       "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                       customer.status === 'active' ? "bg-green-50 text-green-600 border border-green-100" :
                       customer.status === 'new' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                       "bg-slate-100 text-slate-400 border border-slate-200"
                     )}>
                        {customer.status}
                     </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Send Email">
                          <MailIcon className="w-4 h-4" />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Remove Account">
                          <Trash2 className="w-4 h-4" />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing 4 of 1,284 Customers</p>
             <div className="flex gap-2">
                <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-400 hover:bg-slate-50">Prev</button>
                <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-400 hover:bg-slate-50">Next</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
