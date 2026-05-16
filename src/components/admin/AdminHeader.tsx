import { 
  Search, Bell, Menu, PlusCircle, Globe, 
  Moon, Sun, LayoutGrid, CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: HeaderProps) {
  const [notifications, setNotifications] = useState(3);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 glass dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800 px-4 md:px-8 py-4 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Search */}
        <div className="flex items-center gap-4 flex-grow">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 shadow-sm hover:bg-slate-50 transition-all active:scale-90"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative max-w-md w-full hidden md:block group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search anything (Orders, SKU, Customers...)" 
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm dark:text-white"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-[10px] font-black text-slate-400">
               ⌘K
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-5">
          <div className="hidden lg:flex items-center border-r border-slate-200 dark:border-slate-700 pr-5 mr-3 gap-3">
             <button className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-xs font-bold text-slate-600 dark:text-slate-400">
                <Globe className="w-4 h-4" />
                Live Shop
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all text-xs font-bold border border-indigo-100/50 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 shadow-lg shadow-indigo-100/20 transition-all active:scale-95">
                <PlusCircle className="w-4 h-4" />
                Quick Add
             </button>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative group">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-pulse">
                  {notifications}
                </span>
              )}
              <div className="absolute top-full mt-2 right-0 w-64 glass dark:bg-slate-800 shadow-2xl rounded-2xl p-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all pointer-events-none border border-slate-200/50 dark:border-slate-700">
                 <h5 className="font-extrabold text-sm mb-3 dark:text-white">Recent Alerts</h5>
                 <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className="flex gap-3 text-xs leading-relaxed">
                         <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                         </div>
                         <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">New Order Recieved</p>
                            <p className="text-slate-400">Order #882 has been placed successfully.</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </button>
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all md:block hidden">
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              {theme === 'light' ? <Sun className="w-5 h-5 transition-transform group-hover:scale-110" /> : <Moon className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-all" />}
            </button>
          </div>

          <div className="flex items-center gap-3 pl-2 md:pl-5 border-l border-slate-200 dark:border-slate-700">
             <div className="hidden md:block text-right">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Status</p>
                <div className="flex items-center gap-2 justify-end">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                   <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Verified</span>
                </div>
             </div>
             <button className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/10 ring-offset-2 hover:ring-primary shadow-lg transition-all active:scale-95">
                <img src={`https://ui-avatars.com/api/?name=Admin&background=${theme === 'light' ? '6366f1' : '4f46e5'}&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
             </button>
          </div>
        </div>
      </div>
    </header>
  );
}
