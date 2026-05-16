import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { AnimatePresence, motion } from 'motion/react';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#fcfdfe] dark:bg-slate-950 transition-colors duration-300">
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-grow flex flex-col min-w-0">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-grow p-4 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
