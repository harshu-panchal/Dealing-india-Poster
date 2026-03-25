import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, fullScreen = false }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-[2000] p-md" onClick={onClose}>
          <motion.div 
            className={`bg-card w-full flex flex-col shadow-lg overflow-hidden ${fullScreen ? 'max-w-full h-[100dvh] max-h-[100dvh] rounded-none' : 'max-w-[600px] max-h-[90vh] rounded-lg'}`}
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            <div className="p-md px-lg border-b border-border flex justify-between items-center">
              <h2 className="text-[1.25rem] font-bold">{title}</h2>
              <button className="bg-transparent text-text-secondary p-1 hover:text-error" onClick={onClose}>
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-lg">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
