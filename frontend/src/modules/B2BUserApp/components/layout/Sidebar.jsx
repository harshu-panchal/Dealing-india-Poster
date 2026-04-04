import React from 'react';
import { 
  Globe, LayoutGrid, FolderPlus, Heart, 
  CalendarDays, Settings, Share2, HelpCircle, 
  ThumbsUp, Info, User, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, isPersistent = false, userName = "John Doe", phoneNumber = "6261265704" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutGrid size={20} />, label: "Home", path: "/" },
    { icon: <User size={20} />, label: "Profile", path: "/profile" },
    { icon: <Globe size={20} />, label: "Make Your Website", color: "text-blue-600", path: "/dashboard" },
    { icon: <LayoutGrid size={20} />, label: "Categories", path: "/categories" },
    { icon: <FolderPlus size={20} />, label: "Collections", path: "/my-posters" },
    { icon: <Heart size={20} />, label: "Trending", path: "/trending" },
    { icon: <CalendarDays size={20} />, label: "Events Calendar", path: "/calendar" },
    { icon: <ThumbsUp size={20} />, label: "What's New", path: "/whats-new" },
    { icon: <Settings size={20} />, label: "Settings", path: "/dashboard" },
    { icon: <Share2 size={20} />, label: "Share App", onClick: () => {
      if (navigator.share) {
        navigator.share({
          title: 'Posters App',
          text: 'Check out this amazing posters app!',
          url: window.location.origin,
        });
      } else {
        alert('Sharing is not supported on this browser');
      }
    }},
    { icon: <HelpCircle size={20} />, label: "Help Center", path: "/dashboard" },
    { icon: <Info size={20} />, label: "About Us", path: "/dashboard" },
  ];

  const sidebarContent = (
    <div className={`${isPersistent ? 'relative h-full' : 'fixed top-0 left-0 bottom-0'} w-[280px] bg-white z-[2001] shadow-xl flex flex-col border-r border-[#f1f5f9]`}>
      {/* Red Profile Section */}
      <div className="bg-[#ef4444] p-6 pt-10 text-white relative">
        {!isPersistent && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        )}
        
        <div className="flex flex-col gap-3">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
            <User size={36} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{userName}</h2>
            <p className="text-sm opacity-80 font-medium">{phoneNumber}</p>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="text-sm font-bold underline underline-offset-4 text-white/90 active:opacity-70 transition-opacity w-fit"
          >
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
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                  if (!isPersistent) onClose();
                  return;
                }
                if (item.path) {
                  navigate(item.path);
                  if (!isPersistent) onClose();
                }
              }}
              className={`flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-none bg-transparent group ${location.pathname === item.path ? 'bg-gray-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`${item.color || (location.pathname === item.path ? 'text-[#ef4444]' : "text-[#64748b]")} transition-colors`}>
                  {item.icon}
                </div>
                <span className={`text-[0.95rem] font-bold ${location.pathname === item.path ? 'text-[#ef4444]' : "text-[#334155]"} transition-colors`}>
                  {item.label}
                </span>
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
    </div>
  );

  if (isPersistent) {
    return sidebarContent;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[2000] backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 z-[2001] "
          >
            {sidebarContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
