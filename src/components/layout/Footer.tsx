import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-500 py-3 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
        <div className="flex items-center gap-2">
          © {new Date().getFullYear()} 
          <img src="/input_file_0.png" alt="AFD House" className="h-6 w-6 rounded shadow-xs bg-slate-50" referrerPolicy="no-referrer" />
          - afdhouse.com. Bangladesh Online Fashion Leader.
        </div>
        <div className="flex items-center space-x-4 font-semibold text-slate-600">
          <span>Support: +880 1712-345678</span>
          <span className="cursor-pointer hover:text-primary">WhatsApp Chat</span>
          <span className="cursor-pointer hover:text-primary">Facebook</span>
        </div>
      </div>
    </footer>
  );
}
