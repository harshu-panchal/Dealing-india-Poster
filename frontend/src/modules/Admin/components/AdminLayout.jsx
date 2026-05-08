// Refresh
import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Music, Layers, 
  Image as ImageIcon, Share2, LogOut, Bell, 
  Settings, ChevronRight, Calendar, Menu, X,
  Moon, Sun, ChevronDown, UserCircle, Sparkles, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import '../admin.css';

import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutAdmin, admin: adminInfo } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [alerts, setAlerts] = useState({ feedback: 0, users: 0 });

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchAlerts = async () => {
    if (!adminInfo?.accessToken) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${adminInfo?.accessToken}` }
      };
      const { data } = await axios.get(`${API_URL}/admin/dashboard/sidebar-alerts`, config);
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  useEffect(() => {
    if (adminInfo?.accessToken) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 60000); // Poll every minute
      return () => clearInterval(interval);
    }
  }, [adminInfo]);

  // Sync Dark Mode with DOM
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin_theme', 'light');
    }
  };

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navSections = useMemo(() => [
    {
      label: "OVERVIEW",
      items: [
        { title: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      label: "USERS & CONTENT",
      items: [
        { title: 'User Management', path: '/admin/users', icon: Users, badge: alerts.users },
        { title: 'Music Library', path: '/admin/music', icon: Music },
        { title: 'Template Manager', path: '/admin/templates', icon: ImageIcon },
        { title: 'Poster Backgrounds', path: '/admin/backgrounds', icon: ImageIcon },
        { title: 'Layout Frames', path: '/admin/frames', icon: Sparkles },

        { title: 'Sticker Registry', path: '/admin/stickers', icon: Sparkles },
        { title: 'User Feedback', path: '/admin/feedback', icon: MessageSquare, badge: alerts.feedback },
      ]
    },
    {
      label: "SYSTEM",
      items: [
        { title: 'Categories', path: '/admin/categories', icon: Layers },
        { title: 'Events Calendar', path: '/admin/events', icon: Calendar },
        { title: 'Referral Points', path: '/admin/referrals', icon: Share2 },
        { title: 'System Configuration', path: '/admin/settings', icon: Settings }
      ]
    }
  ], [alerts]);

  const breadcrumbs = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.map((part, i) => {
      const path = '/' + parts.slice(0, i + 1).join('/');
      return { 
        name: part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' '),
        path 
      };
    });
  }, [location.pathname]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed lg:relative`}>
        <div className="h-16 flex items-center px-6 border-b border-[var(--admin-border)] gap-3 shrink-0">
          <div className="w-8 h-8 bg-[#ef4444] rounded-lg flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <Layers size={18} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 leading-none mb-1">Dealingindia</span>
            <span className="text-[0.7rem] font-black text-[var(--admin-text-main)] tracking-normal uppercase">POSTER ADMIN</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-2">
              <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                {section.label}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink 
                    key={item.path} 
                    to={item.path} 
                    className={({ isActive }) => `admin-nav-item flex items-center justify-between ${isActive ? 'active' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg shadow-red-500/20 animate-pulse">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--admin-border)] bg-[var(--admin-sidebar-bg)]">
          <div className="bg-white dark:bg-slate-900/50 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shrink-0 overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=Admin&background=ef4444&color=fff" alt="User" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[0.8rem] font-bold truncate">Super Admin</p>
               <p className="text-[0.65rem] font-medium text-slate-400 truncate uppercase tracking-widest">Active Now</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-header">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-400 border-none bg-transparent cursor-pointer"
              >
                <Menu size={22} />
              </button>
              
              <div className="hidden lg:flex items-center text-[0.7rem] font-bold gap-2 text-slate-400">
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={crumb.path}>
                    <span className={i === breadcrumbs.length - 1 ? 'text-[var(--admin-primary)] font-black uppercase tracking-widest' : 'hover:text-slate-600 transition-colors'}>
                      {crumb.name}
                    </span>
                    {i < breadcrumbs.length - 1 && <ChevronRight size={12} className="text-slate-300" />}
                  </React.Fragment>
                ))}
              </div>
           </div>

           <div className="flex items-center gap-2 lg:gap-6">
              <div className="flex items-center gap-1.5 lg:gap-3">
                 <button 
                   onClick={toggleDarkMode}
                   className="p-2 text-slate-400 hover:text-[var(--admin-primary)] hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer flex items-center justify-center transform active:scale-95"
                 >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                 </button>
                 
                 <div className="relative">
                    <button className="p-2 text-slate-400 hover:text-[var(--admin-primary)] hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer">
                       <Bell size={20} />
                       <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                 </div>

                 <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

                 <button className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-slate-50 rounded-xl transition-all border-none bg-transparent cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-[#ef4444] text-white flex items-center justify-center font-black text-xs">SU</div>
                    <div className="hidden sm:block text-left">
                       <p className="text-[0.65rem] font-black leading-none uppercase tracking-widest mb-0.5">Super Admin</p>
                       <p className="text-[0.6rem] font-bold text-slate-400 leading-none lowercase">@superadmin</p>
                    </div>
                 </button>
              </div>
           </div>
        </header>

        <section className="admin-content relative w-full max-w-full overflow-x-hidden">
          <div className="min-h-full w-full max-w-full overflow-x-hidden">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
