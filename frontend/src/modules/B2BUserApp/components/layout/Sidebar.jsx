import React, { useState } from 'react';
import { 
  Globe, LayoutGrid, FolderPlus, Heart, 
  CalendarDays, Settings, Share2, HelpCircle, 
  ThumbsUp, Info, User, X, LogOut, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose, isPersistent = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userName = user?.user?.name || "User";
  const identifier = user?.user?.mobileNumber || user?.user?.email || "No Identifier";

  const handleActualLogout = async () => {
    await logout();
    navigate('/login');
    setShowLogoutModal(false);
    if (!isPersistent) onClose();
  };

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
    { 
        icon: <Share2 size={20} />, 
        label: "Share App", 
        onClick: () => {
          if (navigator.share) {
            navigator.share({
              title: 'Posters App',
              text: 'Check out this amazing posters app!',
              url: window.location.origin,
            });
          } else {
            alert('Sharing is not supported on this browser');
          }
        }
    },
    { icon: <HelpCircle size={20} />, label: "Help Center", path: "/dashboard" },
    { icon: <LogOut size={20} />, label: "Logout", color: "text-red-500", onClick: () => setShowLogoutModal(true) },
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
            <p className="text-sm opacity-80 font-medium">{identifier}</p>
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
                  if (!isPersistent && !item.label.includes('Logout')) onClose();
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

  const logoutModal = (
    <AnimatePresence>
      {showLogoutModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutModal(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-[min(400px,94%)] bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-[#ef4444]" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-[#ef4444] mb-6">
                <AlertCircle size={32} />
              </div>
              
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Logout Session</h3>
              <p className="text-slate-500 text-sm font-semibold mb-8 leading-relaxed">
                Are you sure you want to end your current session? You'll need to verify your OTP again to log back in.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={handleActualLogout}
                  className="w-full h-14 bg-[#ef4444] text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-red-100 active:scale-[0.98] transition-all border-none cursor-pointer"
                >
                  Yes, Logout
                </button>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full h-14 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-slate-100 active:scale-[0.98] transition-all border-none cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (isPersistent) {
    return (
      <>
        {sidebarContent}
        {logoutModal}
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[2000]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {logoutModal}
    </>
  );


};

export default Sidebar;
