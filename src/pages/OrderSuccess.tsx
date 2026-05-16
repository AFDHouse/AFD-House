import { Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';
import { motion } from 'motion/react';

export default function OrderSuccess() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-32 flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl shadow-blue-100 text-center space-y-8"
      >
        <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Success!</h1>
          <p className="text-gray-500 leading-relaxed">
            Your order has been placed successfully. We'll start processing it right away. You'll receive a confirmation call shortly.
          </p>
        </div>

        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
            <Package className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900 text-sm">Order Status</h3>
            <p className="text-xs text-gray-500">Currently: <span className="text-blue-600 font-bold uppercase">Pending</span></p>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <Link 
            to="/track-order" 
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <span>Track My Order</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/" 
            className="w-full py-5 bg-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-200 transition-all font-bold"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
