import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, User, Search, Menu, X, LogOut, ChevronDown, 
  Heart, Package, UserCircle, Settings, ShieldCheck, Flag,
  Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import AuthModal from '../common/AuthModal';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { 
    user, profile, logout, isAdmin, 
    isAuthModalOpen, setAuthModalOpen,
    authModalMode, setAuthModalMode 
  } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const categories = [
    { name: "Men's Fashion", href: '/category/men' },
    { name: "Women's Fashion", href: '/category/women' },
    { name: 'Kids Zone', href: '/category/kids' },
    { name: 'Electronics', href: '/category/electronics' },
    { name: 'Flash Deals', href: '/category/flash-deals' },
  ];

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setIsOpen(false);
  };

  return (
    <>
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 shadow-sm transition-all duration-300">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-20 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 group">
            <div className="relative">
              <div className="absolute inset-0 bg-slate-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <img 
                src="/rrrr.png" 
                alt="AFD House" 
                className="h-14 w-14 relative rounded-2xl shadow-lg border border-white dark:border-slate-700 p-1.5 object-contain bg-white dark:bg-slate-800 transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="ml-3 hidden lg:block">
              <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">AFD HOUSE</h1>
              <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Premium Fashion</p>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search for premium fashion & lifestyle..."
              className="w-full pl-11 pr-4 py-3 bg-slate-100/50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-[1.25rem] text-sm font-medium focus:outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-slate-500/30 focus:ring-4 focus:ring-slate-500/5 transition-all dark:text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/search?q=${e.currentTarget.value}`);
                }
              }}
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-400">
                ⌘K
              </span>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <div className="flex items-center space-x-2 md:space-x-5">
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/wishlist" 
                    className="p-2.5 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-xl transition-all relative"
                    title="Wishlist"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>

                  <div className="h-6 w-px bg-slate-200" />
                  
                  <div className="relative group shrink-0">
                    <button className="flex items-center space-x-2.5 p-1.5 pl-2.5 pr-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-slate-200 dark:shadow-slate-500/20">
                        {user.displayName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[100px]">
                          {user.displayName || 'My Account'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">View Profile</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform" />
                    </button>
                    
                    <div className="absolute right-0 w-64 mt-2 p-2 bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all z-50">
                      <div className="px-4 py-3 mb-2 border-b border-slate-50 dark:border-slate-700">
                         <p className="text-sm font-black text-slate-900 dark:text-white">{user.displayName || 'Welcome'}</p>
                         <p className="text-[10px] font-medium text-slate-400 truncate">{user.email || user.phoneNumber}</p>
                      </div>
                      
                      <div className="space-y-0.5">
                        <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                          <UserCircle className="w-4 h-4 mr-3" />
                          My Account
                        </Link>
                        <Link to="/orders" className="flex items-center px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                          <Package className="w-4 h-4 mr-3" />
                          Orders
                        </Link>
                        <Link to="/wishlist" className="flex items-center px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                          <Heart className="w-4 h-4 mr-3" />
                          Wishlist
                        </Link>
                        
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center px-4 py-2.5 text-sm font-bold text-primary dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                            <ShieldCheck className="w-4 h-4 mr-3" />
                            Admin Dashboard
                          </Link>
                        )}
                        
                        <div className="my-2 border-t border-slate-50 dark:border-slate-700" />
                        
                        <button
                          onClick={logout}
                          className="w-full flex items-center px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => handleOpenAuth('signin')}
                    className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-primary transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => handleOpenAuth('signup')}
                    className="px-6 py-2.5 bg-gradient-to-r from-slate-800 to-slate-700 text-white text-sm font-black rounded-xl shadow-lg shadow-slate-200 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={toggleTheme}
              className="p-3 text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </button>

            <Link to="/cart" className="p-3 text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all relative shrink-0 group">
              <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-3 text-slate-500 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category Bar Row (Desktop Only) */}
      <div className="hidden md:block border-t border-slate-50 dark:border-white/5 py-3 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center space-x-8">
                {categories.map((cat) => (
                    <Link
                        key={cat.name}
                        to={cat.href}
                        className="text-[13px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all flex items-center gap-1.5"
                    >
                        {cat.name}
                        {cat.name === "Men's Fashion" && <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
                    </Link>
                ))}
            </div>
            
            <div className="flex items-center space-x-6 text-[13px]">
                <div className="flex items-center space-x-2 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-bold uppercase tracking-widest text-[10px]">Free Delivery Order Over ৳1000</span>
                </div>
                <div className="h-4 w-px bg-slate-100 dark:bg-white/5" />
                <span className="text-primary font-bold flex items-center gap-1">
                    <Flag className="w-3.5 h-3.5" />
                    BD | BDT
                </span>
            </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div
            className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-slate-900 shadow-2xl z-[60] p-6 space-y-8 md:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Menu</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categories</p>
                {categories.map((cat) => (
                    <Link
                        key={cat.name}
                        to={cat.href}
                        onClick={() => setIsOpen(false)}
                        className="block text-lg font-bold text-slate-700 hover:text-slate-900 transition-colors"
                    >
                        {cat.name}
                    </Link>
                ))}
              </div>

              {!user && (
                <div className="flex flex-col gap-3 pt-6 border-t border-slate-50">
                  <button
                    onClick={() => handleOpenAuth('signin')}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('signup')}
                    className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {user && (
                <div className="space-y-4 pt-6 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My Account</p>
                    <Link to="/profile" className="flex items-center text-lg font-bold text-slate-700">
                        <UserCircle className="w-5 h-5 mr-3 text-slate-400" />
                        Profile
                    </Link>
                    <Link to="/orders" className="flex items-center text-lg font-bold text-slate-700">
                        <Package className="w-5 h-5 mr-3 text-slate-400" />
                        Orders
                    </Link>
                    <button
                        onClick={logout}
                        className="flex items-center text-lg font-bold text-red-500"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
              )}
            </div>
        </div>
      )}
    </nav>
    
    <AuthModal 
      isOpen={isAuthModalOpen} 
      onClose={() => setAuthModalOpen(false)} 
      initialMode={authModalMode}
    />
    </>
  );
}
