import { useState, useEffect, FormEvent, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Product } from '../../types';
import { 
  Plus, Search, Filter, Edit2, Trash2, MoreVertical, X, Upload, 
  Check, ImageIcon, Loader2, AlertCircle, 
  Star, Package, DollarSign, Tag, Info, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  category: string;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  sku: string;
  status: 'active' | 'draft' | 'archived';
  isFeatured: boolean;
}

export default function ProductsManager() {
  const { theme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    category: 'men',
    stock: 10,
    sizes: ['M', 'L', 'XL'],
    colors: ['Black', 'Navy'],
    images: [],
    sku: '',
    status: 'active',
    isFeatured: false,
  });

  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('#000000');

  // New states for Delete Flow
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchProducts = async () => {
    setLoading(true);
    const path = 'products';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const path = 'products';
    try {
      const productData = {
        ...formData,
        discountPrice: formData.discountPrice || undefined,
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, path, editingProduct.id), productData);
      } else {
        await addDoc(collection(db, path), {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }
      setIsModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    const id = productToDelete.id;
    const imageUrls = productToDelete.images || [];

    try {
      const path = 'products';
      // 1. Delete from Firestore directly
      await deleteDoc(doc(db, path, id));

      // 2. Delete images from storage
      if (imageUrls && Array.isArray(imageUrls)) {
        for (const url of imageUrls) {
          if (url && url.includes('firebasestorage.googleapis.com')) {
            try {
              const imageRef = ref(storage, url);
              await deleteObject(imageRef);
            } catch (err) {
              console.warn('Could not delete image from storage:', err);
            }
          }
        }
      }
      
      setToast({ message: 'Product deleted successfully', type: 'success' });
      setShowDeleteConfirm(false);
      setProductToDelete(null);
      
      // 3. Instantly update UI by filtering local state
      setProducts(prev => prev.filter(p => p.id !== id));
      
    } catch (error: any) {
      console.error('Delete error details:', {
        message: error.message,
        code: error.code,
        email: auth.currentUser?.email,
        uid: auth.currentUser?.uid,
        emailVerified: auth.currentUser?.emailVerified
      });
      setToast({ 
        message: error.code === 'permission-denied' 
          ? 'Permission Denied: You are not authorized to delete products.' 
          : (error.message || 'Failed to delete product'), 
        type: 'error' 
      });
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      discountPrice: 0,
      category: 'men',
      stock: 10,
      sizes: ['M', 'L', 'XL'],
      colors: ['Black', 'Navy'],
      images: [],
      sku: '',
      status: 'active',
      isFeatured: false,
    });
    setUploadProgress({});
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(async (file) => {
      const fileId = Math.random().toString(36).substring(7);
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        },
        (error) => {
          console.error('Upload error:', error);
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[fileId];
            return next;
          });
          alert(`Failed to upload ${file.name}`);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, downloadURL]
          }));
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[fileId];
            return next;
          });
        }
      );
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    }
  });

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const addCustomSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, newSize] }));
      setNewSize('');
    }
  };

  const addColor = () => {
    if (!formData.colors.includes(newColor)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, newColor] }));
    }
  };

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || 0,
      category: product.category,
      stock: product.stock,
      sizes: product.sizes || [],
      colors: product.colors || [],
      images: product.images || [],
      sku: product.sku || '',
      status: product.status || 'active',
      isFeatured: product.isFeatured || false,
    });
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const predefinedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <>
    <div className="space-y-8">
      {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              Products Inventory
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Manage your eCommerce stock, pricing, and visual presentation.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="px-6 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-primary transition-all shadow-lg shadow-slate-200 dark:shadow-slate-900 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add New Product
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: 'Total Products', value: products.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
             { label: 'Active Items', value: products.filter(p => p.status === 'active').length, icon: Check, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
             { label: 'Low Stock', value: products.filter(p => p.stock < 10).length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
             { label: 'Featured', value: products.filter(p => p.isFeatured).length, icon: Star, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
           ].map((stat) => (
             <motion.div 
               whileHover={{ y: -2 }}
               key={stat.label} 
               className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4"
             >
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                   <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                   <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
                   <p className="text-xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Table & Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-900/30">
             <div className="relative flex-grow max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or SKU..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm dark:text-white" 
                />
             </div>
             <div className="flex items-center gap-3">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="men">Men's Fashion</option>
                  <option value="women">Women's Fashion</option>
                  <option value="kids">Kids Zone</option>
                </select>
                <button className="p-2.5 hover:bg-white hover:border-slate-300 border border-transparent rounded-xl text-slate-500 transition-all flex items-center gap-2 text-sm font-bold">
                   <Filter className="w-4 h-4" />
                   Filters
                </button>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-8 py-5 font-black">Product Info</th>
                  <th className="px-8 py-5 font-black">Category</th>
                  <th className="px-8 py-5 font-black">Inventory</th>
                  <th className="px-8 py-5 font-black">Pricing</th>
                  <th className="px-8 py-5 font-black">Status</th>
                  <th className="px-8 py-5 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={product.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-18 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-600/50 shadow-sm relative group-hover:scale-105 transition-transform duration-300">
                          <img src={product.images[0] || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          {product.isFeatured && (
                            <div className="absolute top-1 right-1 p-1 bg-primary text-white rounded-md shadow-lg">
                               <Star className="w-2.5 h-2.5 fill-current" />
                            </div>
                          )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors text-sm">{product.name}</h4>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">SKU: {product.sku || 'N/A'}</p>
                            <div className="flex gap-1 mt-2">
                                {product.sizes?.slice(0, 3).map(s => (
                                  <span key={s} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded text-[9px] font-black">{s}</span>
                                ))}
                                {product.sizes?.length > 3 && <span className="text-[9px] text-slate-400 dark:text-slate-500">+{product.sizes.length - 3}</span>}
                            </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 capitalize text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full">{product.category}</span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                             <div className={cn(
                               "w-2 h-2 rounded-full",
                               product.stock > 20 ? "bg-green-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                             )} />
                             <span className="font-bold text-slate-700 text-xs">{product.stock} units</span>
                          </div>
                          <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    product.stock > 20 ? "bg-green-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                                )} 
                                style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }} 
                             />
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm">{formatCurrency(product.discountPrice || product.price)}</span>
                          {product.discountPrice && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold line-through">{formatCurrency(product.price)}</span>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        product.status === 'active' ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400" : 
                        product.status === 'draft' ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500" : 
                        "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                      )}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                             onClick={() => openEditModal(product)}
                             className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-all"
                             title="Edit Product"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => confirmDelete(product)}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Product"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                         <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                </AnimatePresence>
              </tbody>
            </table>
            {!loading && filteredProducts.length === 0 && (
              <div className="py-20 text-center space-y-4">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                    <Search className="w-10 h-10 text-slate-300" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="font-bold text-slate-900">No products found</h3>
                    <p className="text-sm text-slate-400">Try adjusting your search or filters to see more results.</p>
                 </div>
              </div>
            )}
            {loading && (
              <div className="py-20 text-center space-y-4">
                 <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                 <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Synchronizing Inventory...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Modal */}
      <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
          >
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {editingProduct ? 'Update Product' : 'Create New Product'}
                  </h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Product Details & Catalog Management</p>
               </div>
               <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl text-slate-400 transition-all active:scale-95"
               >
                  <X className="w-6 h-6" />
               </button>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              <form id="product-form" onSubmit={handleSave} className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Media & Variants */}
                <div className="lg:col-span-5 space-y-8">
                  {/* Image Upload Area */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <ImageIcon className="w-3 h-3 text-primary" />
                       Media Gallery
                    </label>
                    
                    <div 
                      {...getRootProps()} 
                      className={cn(
                        "border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer group relative overflow-hidden",
                        isDragActive ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                      )}
                    >
                      <input {...getInputProps()} />
                      <div className="space-y-4 relative z-10">
                         <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">Drag images or click to upload</p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">JPG, PNG, WEBP (Max 5MB each)</p>
                         </div>
                      </div>
                      
                      <AnimatePresence>
                         {Object.keys(uploadProgress).length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 space-y-4"
                            >
                               <Loader2 className="w-8 h-8 text-primary animate-spin" />
                               <div className="w-full space-y-2">
                                  {Object.entries(uploadProgress).map(([id, progress]) => (
                                     <div key={id} className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                                     </div>
                                  ))}
                               </div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing Uploads...</p>
                            </motion.div>
                         )}
                      </AnimatePresence>
                    </div>

                    {/* Previews Grid */}
                    <div className="grid grid-cols-4 gap-3 mt-4">
                       {formData.images.map((url, i) => (
                         <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 group bg-slate-50">
                            <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <button 
                                 type="button"
                                 onClick={() => removeImage(i)}
                                 className="p-2 bg-white rounded-lg text-red-500 hover:scale-110 transition-transform shadow-lg"
                                >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                            {i === 0 && (
                              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary text-white rounded text-[8px] font-bold uppercase tracking-widest ring-2 ring-white">
                                Hero
                              </div>
                            )}
                         </div>
                       ))}
                       {Array.from({ length: Math.max(0, 4 - formData.images.length) }).map((_, i) => (
                         <div key={`empty-${i}`} className="aspect-[3/4] border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center bg-slate-50/50">
                            <ImageIcon className="w-5 h-5 text-slate-200" />
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Size Management */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Size Selection</label>
                    <div className="flex flex-wrap gap-2">
                       {predefinedSizes.map(size => (
                         <button
                           key={size}
                           type="button"
                           onClick={() => toggleSize(size)}
                           className={cn(
                             "px-4 py-2 text-xs font-bold rounded-xl border transition-all active:scale-95",
                             formData.sizes.includes(size)
                             ? "bg-slate-900 text-white border-slate-900"
                             : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                           )}
                         >
                           {size}
                         </button>
                       ))}
                    </div>
                    {/* Custom Size Add */}
                    <div className="flex gap-2 mt-3">
                       <input 
                         type="text"
                         placeholder="Custom Size (e.g. 42)"
                         value={newSize}
                         onChange={(e) => setNewSize(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
                         className="flex-grow px-4 py-2 bg-slate-100 border-none rounded-xl text-xs placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/20"
                       />
                       <button 
                         type="button"
                         onClick={addCustomSize}
                         className="p-2 bg-slate-200 hover:bg-slate-300 rounded-xl transition-all"
                       >
                         <Plus className="w-4 h-4 text-slate-600" />
                       </button>
                    </div>
                    {/* Selected Custom Sizes */}
                    <div className="flex flex-wrap gap-2 mt-2">
                       {formData.sizes.filter(s => !predefinedSizes.includes(s)).map(size => (
                         <span key={size} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-primary/20">
                            {size}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSize(size)} />
                         </span>
                       ))}
                    </div>
                  </div>

                   {/* Color Management */}
                   <div className="space-y-3">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Color Palette</label>
                    <div className="flex flex-wrap gap-3">
                       {formData.colors.map(color => (
                         <div key={color} className="relative group">
                            <div 
                              className="w-10 h-10 rounded-full border-2 border-white ring-1 ring-slate-200 shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                            <button 
                              type="button"
                              onClick={() => removeColor(color)}
                              className="absolute -top-1 -right-1 bg-white rounded-full p-1 text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-all border border-slate-100"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                         </div>
                       ))}
                       <div className="relative w-10 h-10">
                          <input 
                            type="color"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            onBlur={addColor}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all">
                             <Plus className="w-4 h-4 text-slate-400" />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Primary Info */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Core Info */}
                  <section className="space-y-5 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <Tag className="w-3 h-3" />
                             Product Name
                          </label>
                          <input 
                            required
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all shadow-sm"
                            placeholder="e.g. Classic Oversized Hoodie"
                          />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <Filter className="w-3 h-3" />
                             Category
                          </label>
                          <select 
                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm shadow-sm"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                          >
                              <option value="men">Men's Fashion</option>
                              <option value="women">Women's Fashion</option>
                              <option value="kids">Kids Zone</option>
                          </select>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Info className="w-3 h-3" />
                           Full Description
                        </label>
                        <textarea 
                          required
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none shadow-sm"
                          placeholder="Tell customers about the quality, fit, and material..."
                        />
                      </div>
                  </section>

                  {/* Inventory & Status */}
                  <section className="grid grid-cols-2 md:grid-cols-3 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <Package className="w-3 h-3" />
                           SKU ID
                        </label>
                        <input 
                          type="text" 
                          value={formData.sku}
                          onChange={(e) => setFormData({...formData, sku: e.target.value})}
                          className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm shadow-sm"
                          placeholder="AFD-SH-001"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           Stock Quantity
                        </label>
                        <input 
                          required
                          type="number" 
                          value={formData.stock}
                          onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                          className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm shadow-sm"
                        />
                      </div>
                       <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           Visibility
                        </label>
                        <select 
                          className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm shadow-sm"
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        >
                            <option value="active">Active (Public)</option>
                            <option value="draft">Draft (Hidden)</option>
                            <option value="archived">Archived</option>
                        </select>
                      </div>
                  </section>

                  {/* Pricing */}
                  <section className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                             <DollarSign className="w-3 h-3" />
                             Regular Price (৳)
                          </label>
                          <input 
                            required
                            type="number" 
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold shadow-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                             Sale Price (Optional)
                          </label>
                          <input 
                            type="number" 
                            value={formData.discountPrice}
                            onChange={(e) => setFormData({...formData, discountPrice: Number(e.target.value)})}
                            className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-green-600 shadow-sm"
                            placeholder="Set lower to trigger badge"
                          />
                        </div>
                     </div>
                  </section>

                  {/* Specialized Toggles */}
                  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                           <Star className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold text-slate-800">Featured Product</h4>
                           <p className="text-[10px] text-slate-400 font-medium">Highlight this item on the homepage showcase</p>
                        </div>
                     </div>
                     <button 
                       type="button"
                       onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
                       className={cn(
                         "w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center",
                         formData.isFeatured ? "bg-primary" : "bg-slate-300"
                       )}
                     >
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
                          formData.isFeatured ? "translate-x-6" : "translate-x-0"
                        )} />
                     </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Actions */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                   <AlertCircle className="w-4 h-4" />
                   All changes will be published instantly across AFD House storefront.
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                   <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-grow md:flex-none px-8 py-3.5 border border-slate-200 bg-white rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm active:scale-95"
                    >
                      Discard Changes
                    </button>
                    <button 
                      form="product-form"
                      type="submit"
                      className="flex-grow md:flex-none px-12 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition-all shadow-xl shadow-slate-200 text-sm active:scale-95 flex items-center justify-center gap-2"
                    >
                      {editingProduct ? 'Save Changes' : 'Create Product'}
                      <Check className="w-5 h-5" />
                    </button>
                </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
      {/* Premium Delete Confirmation Modal */}
      <AnimatePresence>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-white/20 relative overflow-hidden"
          >
            {/* Glassmorphism Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="relative z-10 text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-[2rem] flex items-center justify-center mx-auto mb-2 rotate-6">
                 <AlertTriangle className="w-10 h-10 text-red-600 -rotate-6" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Delete Product?</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Are you sure you want to remove <span className="text-slate-900 font-bold">"{productToDelete?.name}"</span>? 
                  This action is permanent and will remove all stock and image data.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting from Database...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Confirm Delete Product
                    </>
                  )}
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300]"
          >
            <div className={cn(
              "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md",
              toast.type === 'success' ? "bg-green-500/90 border-green-400 text-white" : "bg-red-500/90 border-red-400 text-white"
            )}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-sm font-bold tracking-tight">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
