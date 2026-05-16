export interface UserProfile {
  uid: string;
  email: string | null;
  phoneNumber?: string | null;
  displayName: string | null;
  role: 'user' | 'admin';
  createdAt: any;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  images: string[];
  sku?: string;
  status: 'active' | 'draft' | 'archived';
  isFeatured?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  userId: string;
  customerInfo: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'COD';
  createdAt: any;
}
