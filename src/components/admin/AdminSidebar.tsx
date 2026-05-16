import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Layers, ShoppingCart, 
  Users, BarChart3, Ticket, MessageSquare, 
  PackageSearch, Settings, LogOut, X, ChevronRight, Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: ShoppingBag, label: 'Products', path: '/admin/products' },
  { icon: Layers, label: 'Categories', path: '/admin/categories' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
  { icon: MessageSquare, label: 'Reviews', path: '/admin/reviews' },
  { icon: PackageSearch, label: 'Inventory', path: '/admin/inventory' },
];

const secondaryItems = [
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const { logout } = useAuth();
  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 glass-dark z-[101] transition-transform duration-500 ease-spring lg:translate-x-0 lg:static lg:block shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full bg-gradient-to-b from-slate-900/40 to-slate-950/20">
          {/* Logo Section */}
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-premium rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20 rotate-3">
                 <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">AFD HOUSE</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] -mt-1">Control Center</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-grow px-4 pb-8 space-y-8 overflow-y-auto custom-scrollbar">
            {/* Primary Menu */}
            <div>
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Core Management</p>
              <div className="space-y-1.5">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) => cn(
                      "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                      isActive 
                        ? "bg-gradient-premium text-white shadow-lg shadow-slate-900/20" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-4">
                          <item.icon className={cn(
                            "w-5 h-5 transition-transform group-hover:scale-110",
                            isActive ? "text-white" : "text-slate-400 group-hover:text-primary"
                          )} />
                          <span className="text-sm font-bold tracking-tight">{item.label}</span>
                        </div>
                        {isActive && <motion.div layoutId="sidebar-arrow"><ChevronRight className="w-4 h-4 text-white/50" /></motion.div>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Support/Settings Menu */}
            <div>
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">System</p>
              <div className="space-y-1.5">
                {secondaryItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group",
                      isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>

          {/* User Profile Hook */}
          <div className="p-6 border-t border-white/5 bg-slate-900/40">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-700/30 ring-4 ring-slate-900/5 shadow-2xl">
                   <img src="https://ui-avatars.com/api/?name=Admin&background=1e293b&color=fff" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-white tracking-tight">AFD Admin</h4>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Superuser</p>
                </div>
             </div>
             <button 
               onClick={logout}
               className="w-full flex items-center justify-center gap-3 px-4 py-3 font-black text-[11px] text-red-400 uppercase tracking-[0.2em] bg-red-400/5 hover:bg-red-400/10 border border-red-400/20 rounded-xl transition-all active:scale-95"
             >
                <LogOut className="w-4 h-4" />
                Logout Session
             </button>
          </div>
        </div>
      </aside>
    </>
  );
}
