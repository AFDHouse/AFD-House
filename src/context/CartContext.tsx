import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity: number, size: string, color: string) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (product: any, quantity: number, size: string, color: string) => {
    const existingIndex = cart.findIndex(
      (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color
    );

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      saveCart(newCart);
    } else {
      saveCart([...cart, { ...product, quantity, selectedSize: size, selectedColor: color }]);
    }
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    const newCart = cart.filter(
      (item) => !(item.id === id && item.selectedSize === size && item.selectedColor === color)
    );
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalPrice = cart.reduce((total, item) => total + (item.discountPrice || item.price) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
