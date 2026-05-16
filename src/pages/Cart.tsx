import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatCurrency, cn } from '../lib/utils';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, addToCart, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Your bag is empty</h1>
        <p className="text-gray-500 max-w-sm mx-auto">
          Seems like you haven't added anything to your cart yet. Let's find something amazing for you.
        </p>
        <Link to="/" className="inline-block px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all">
          Explore Fashion
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shopping Bag </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 shadow-sm">
              <div className="w-20 h-24 md:w-24 md:h-32 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                <img 
                    src={item.images[0] || `https://picsum.photos/seed/${item.id}/200/300`} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-grow flex flex-col justify-between py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">{item.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Size: <span className="text-slate-900 font-bold">{item.selectedSize}</span> | Color: <span className="text-slate-900 font-bold">{item.selectedColor}</span></p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex items-center space-x-3 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                    <button 
                        onClick={() => item.quantity > 1 && addToCart(item, -1, item.selectedSize, item.selectedColor)}
                        className="p-1 hover:text-primary transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-slate-900 text-xs w-5 text-center">{item.quantity}</span>
                    <button 
                         onClick={() => addToCart(item, 1, item.selectedSize, item.selectedColor)}
                         className="p-1 hover:text-primary transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-base font-bold text-primary">
                    {formatCurrency((item.discountPrice || item.price) * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 sticky top-24">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Order Summary</h2>
            <div className="space-y-3 text-[11px] font-medium">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-900 font-bold">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge</span>
                <span className="text-slate-900 font-bold">৳0</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Discount</span>
                <span className="text-green-600 font-bold">-৳0</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-bold">
                <span className="text-slate-900">Total</span>
                <span className="text-primary">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-sm flex items-center justify-center space-x-2 hover:bg-primary transition-all shadow-sm active:scale-95"
            >
              <span>Process to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center">
              <p className="text-[10px] text-slate-400">Taxes calculated at checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
