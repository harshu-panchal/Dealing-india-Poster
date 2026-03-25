import React from 'react';
import { 
  Globe, LayoutGrid, FolderPlus, Heart, 
  CalendarDays, Settings, Share2, HelpCircle, 
  ThumbsUp, Info, User, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose, userName = "John Doe", phoneNumber = "6261265704" }) => {
  const menuItems = [
    { icon: <Globe size={20} />, label: "Make Your Website", color: "text-blue-600" },
    { icon: <LayoutGrid size={20} />, label: "Categories" },
    { icon: <FolderPlus size={20} />, label: "Collections", expandable: true },
    { icon: <Heart size={20} />, label: "Liked Posters" },
    { icon: <CalendarDays size={20} />, label: "Events Calendar" },
    { icon: <Settings size={20} />, label: "Settings", expandable: true },
    { icon: <Share2 size={20} />, label: "Share App" },
    { icon: <HelpCircle size={20} />, label: "Help Center", expandable: true },
    { icon: <ThumbsUp size={20} />, label: "Support Us", expandable: true },
    { icon: <Info size={20} />, label: "About Us", expandable: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[2000] backdrop-blur-[2px]"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[2001] shadow-2xl flex flex-col"
          >
            {/* Red Profile Section */}
            <div className="bg-[#ef4444] p-6 pt-10 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="flex flex-col gap-3">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
                  <User size={36} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{userName}</h2>
                  <p className="text-sm opacity-80 font-medium">{phoneNumber}</p>
                </div>
                <button className="text-sm font-bold underline underline-offset-4 text-white/90 active:opacity-70 transition-opacity w-fit">
                  View full profile
                </button>
              </div>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="flex flex-col">
                {menuItems.map((item, index) => (
                  <button 
                    key={index}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-none bg-transparent group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={item.color || "text-[#64748b]"}>
                        {item.icon}
                      </div>
                      <span className="text-[0.95rem] font-bold text-[#334155]">{item.label}</span>
                    </div>
                    {item.expandable && (
                      <span className="text-gray-400 text-lg font-light">+</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100">
               <span className="text-[0.75rem] font-bold text-gray-400">V2.15.10</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
