import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button';

const AdminModal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  icon: Icon, 
  children, 
  footer,
  maxWidth = '600px',
  variant = 'default' // 'default' or 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
          onClick={onClose}
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          style={{ maxWidth }}
          className="relative w-full max-h-[90vh] bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
        >
           {Icon && (
             <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <Icon size={210} className={variant === 'danger' ? 'text-rose-500' : 'text-[#ef4444]'} />
             </div>
           )}

           <div className="flex items-center justify-between p-8 md:p-12 pb-6 md:pb-8 border-b border-slate-50 relative z-10 bg-white">
              <div className="flex items-center gap-4 md:gap-6">
                 {Icon && (
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[1.25rem] md:rounded-2xl flex items-center justify-center shadow-2xl text-white shrink-0 ${variant === 'danger' ? 'bg-rose-500 shadow-rose-500/30' : 'bg-[#ef4444] shadow-red-500/30'}`}>
                       <Icon size={24} className="md:size-7" strokeWidth={variant === 'danger' ? 2.5 : 3} />
                    </div>
                 )}
                 <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
                    <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">{subtitle}</p>
                 </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 border-none bg-transparent cursor-pointer transition-colors relative z-20">
                <X size={20} className="md:size-6" />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-6 md:pt-8 custom-scrollbar relative z-10 text-slate-600">
              {children}
           </div>

           {footer && (
             <div className="p-8 md:p-12 pt-0 relative z-10">
                {footer}
             </div>
           )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminModal;
