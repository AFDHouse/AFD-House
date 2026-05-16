import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Search from './pages/Search';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import TrackOrder from './pages/TrackOrder';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import ProductsManager from './pages/Admin/Products';
import OrdersManager from './pages/Admin/Orders';
import CustomersPage from './pages/Admin/Customers';
import AnalyticsPage from './pages/Admin/Analytics';

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading, isAdmin } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
              <Routes>
            {/* Public/Shop Routes (with Navbar/Footer) */}
            <Route path="/" element={<><Navbar /><main className="flex-grow pt-20"><Home /></main><Footer /></>} />
            <Route path="/search" element={<><Navbar /><main className="flex-grow pt-20"><Search /></main><Footer /></>} />
            <Route path="/category/:slug" element={<><Navbar /><main className="flex-grow pt-20"><CategoryPage /></main><Footer /></>} />
            <Route path="/product/:id" element={<><Navbar /><main className="flex-grow pt-20"><ProductDetail /></main><Footer /></>} />
            <Route path="/cart" element={<><Navbar /><main className="flex-grow pt-20"><Cart /></main><Footer /></>} />
            <Route path="/track-order" element={<><Navbar /><main className="flex-grow pt-20"><TrackOrder /></main><Footer /></>} />
            <Route path="/order-success" element={<><Navbar /><main className="flex-grow pt-20"><OrderSuccess /></main><Footer /></>} />
            
            <Route path="/checkout" element={
              <PrivateRoute>
                <Navbar /><main className="flex-grow pt-20"><Checkout /></main><Footer />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Navbar /><main className="flex-grow pt-20"><Profile /></main><Footer />
              </PrivateRoute>
            } />

            <Route path="/orders" element={
              <PrivateRoute>
                <Navbar /><main className="flex-grow pt-20"><Orders /></main><Footer />
              </PrivateRoute>
            } />

            <Route path="/wishlist" element={
              <PrivateRoute>
                <Navbar /><main className="flex-grow pt-20"><Wishlist /></main><Footer />
              </PrivateRoute>
            } />

            {/* Admin Routes (Custom Layout) */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductsManager />} />
              <Route path="orders" element={<OrdersManager />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              {/* Fallbacks */}
              <Route path="*" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </div>
        </CartProvider>
      </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
