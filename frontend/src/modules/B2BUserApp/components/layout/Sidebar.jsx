import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Globe, LayoutGrid, FolderPlus, Heart, 
  CalendarDays, Settings, Share2, HelpCircle, 
  ThumbsUp, Info, User, X, LogOut, AlertCircle, Award, Briefcase, 
  MessageSquare, Instagram, Facebook, Youtube, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose, isPersistent = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [appSettings, setAppSettings] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  const userName = user?.user?.name || "User";
  const identifier = user?.user?.mobileNumber || user?.user?.email || "No Identifier";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/settings`);
        setAppSettings(data);
      } catch (error) {
        console.error('Failed to fetch sidebar settings:', error);
      }
    };
    fetchSettings();
  }, [API_URL]);

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
    { icon: <Briefcase size={20} />, label: "Business", path: "/categories" },
    { icon: <Heart size={20} />, label: "Liked Posters", path: "/liked-posters" },
    { icon: <FolderPlus size={20} />, label: "Collections", path: "/my-posters" },
    { icon: <Heart size={20} />, label: "Trending", path: "/trending" },
    { icon: <CalendarDays size={20} />, label: "Events Calendar", path: "/calendar" },
    { icon: <ThumbsUp size={20} />, label: "What's New", path: "/whats-new" },
    { icon: <Award size={20} />, label: "Refer & Earn", path: "/referral" },
    { icon: <Settings size={20} />, label: "Settings", path: "/dashboard" },

    { 
        id: 'help-group',
        icon: <HelpCircle size={20} />, 
        label: "Help & Support", 
        isGroup: true,
        subItems: [
           { 
               icon: <HelpCircle size={16} />, 
               label: "How to use app", 
               path: "/help?tab=faq"
           },
           { 
               icon: <MessageSquare size={16} />, 
               label: "Direct Support", 
               path: "/help?tab=support"
           }
        ]
    },
    { icon: <LogOut size={20} />, label: "Logout", color: "text-red-500", onClick: () => setShowLogoutModal(true) },
  ];

  const [isHelpExpanded, setIsHelpExpanded] = useState(false);

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
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 overflow-hidden shadow-inner">
            {user?.user?.profilePhoto ? (
               <img src={user.user.profilePhoto} className="w-full h-full object-cover" alt="" />
            ) : (
               <User size={36} className="text-white" />
            )}
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
      <div className="flex-1 overflow-y-auto py-2">
        <div className="flex flex-col">
          {menuItems.map((item, index) => {
            if (item.isGroup) {
               return (
                  <div key={index} className="flex flex-col">
                     <button 
                       onClick={() => setIsHelpExpanded(!isHelpExpanded)}
                       className={`flex items-center justify-between px-6 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-none bg-transparent group`}
                     >
                        <div className="flex items-center gap-4 text-[#334155]">
                           <div className="text-[#64748b] group-hover:text-[#ef4444] transition-colors">
                             {item.icon}
                           </div>
                           <span className="text-[0.92rem] font-bold group-hover:text-[#ef4444] transition-colors">
                             {item.label}
                           </span>
                        </div>
                        <ChevronDown size={16} className={`text-[#64748b] transition-transform duration-300 ${isHelpExpanded ? 'rotate-180' : ''}`} />
                     </button>
                     
                     <AnimatePresence>
                        {isHelpExpanded && (
                           <motion.div 
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: 'auto', opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="overflow-hidden bg-slate-50/50"
                           >
                              {item.subItems.map((sub, sIdx) => (
                                 <button 
                                   key={sIdx}
                                   onClick={() => {
                                      navigate(sub.path);
                                      if (!isPersistent) onClose();
                                   }}
                                   className={`flex items-center gap-4 pl-14 pr-6 py-2.5 hover:bg-red-50/50 transition-colors border-none bg-transparent group`}
                                 >
                                    <div className={`text-[#94a3b8] group-hover:text-[#ef4444] transition-colors`}>
                                       {sub.icon}
                                    </div>
                                    <span className="text-[0.85rem] font-bold text-slate-500 group-hover:text-[#ef4444] transition-colors">
                                       {sub.label}
                                    </span>
                                 </button>
                              ))}
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               );
            }

            return (
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
                className={`flex items-center justify-between px-6 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-none bg-transparent group ${location.pathname === item.path ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`${item.color || (location.pathname === item.path ? 'text-[#ef4444]' : "text-[#64748b]")} transition-colors`}>
                    {item.icon}
                  </div>
                  <span className={`text-[0.92rem] font-bold ${location.pathname === item.path ? 'text-[#ef4444]' : "text-[#334155]"} transition-colors`}>
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Social & Version Footer */}
      <div className="p-6 border-t border-gray-100 space-y-5 bg-gray-50/30">
         <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Connect with us</span>
            <div className="flex items-center gap-4">
               {appSettings?.socialLinks?.instagram && (
                 <a href={appSettings.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm border border-gray-100 hover:scale-110 active:scale-95 transition-all">
                    <Instagram size={18} />
                 </a>
               )}
               {appSettings?.socialLinks?.facebook && (
                 <a href={appSettings.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100 hover:scale-110 active:scale-95 transition-all">
                    <Facebook size={18} />
                 </a>
               )}
               {appSettings?.socialLinks?.youtube && (
                 <a href={appSettings.socialLinks.youtube} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm border border-gray-100 hover:scale-110 active:scale-95 transition-all">
                    <Youtube size={18} />
                 </a>
               )}
            </div>
         </div>

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
