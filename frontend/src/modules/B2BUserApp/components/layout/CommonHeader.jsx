import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, HelpCircle, Search, Mic, CalendarCheck, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEditor } from '../../context/EditorContext';


const CommonHeader = ({ showSearch = false, onSearchChange, searchQuery, onOpenSidebar }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openCustomPosterEditor } = useEditor();


  return (
    <nav 
      className="bg-[#b91c1c] px-3 z-[1000] shadow-[0_2px_8px_rgba(0,0,0,0.1)] w-full flex-shrink-0"
      style={{ 
        paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))'
      }}
    >
      <div className="flex items-center justify-between max-w-[1200px] mx-auto">
        <div className="flex items-center gap-1.5 md:gap-3">
          <div 
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#b91c1c] cursor-pointer flex-shrink-0 overflow-hidden shadow-inner border border-white/20"
            onClick={onOpenSidebar}
          >
             {user?.user?.profilePhoto ? (
                <img src={user.user.profilePhoto} className="w-full h-full object-cover" alt="" />
             ) : (
                <User size={18} />
             )}
          </div>
          <span className="text-white text-[1rem] md:text-[1.15rem] font-bold whitespace-nowrap">Posters</span>
          <button 
            onClick={() => window.open('https://www.dealingindia.com/landing', '_blank')}
            className="bg-[#fde047] text-[#854d0e] px-1.5 md:px-2.5 py-1 rounded-sm text-[0.6rem] md:text-[0.7rem] font-extrabold flex items-center gap-1 ml-0.5 md:ml-1 flex-shrink-0 cursor-pointer border-none outline-none shadow-sm hover:bg-[#facc15] transition-colors"
          >
             Dealingindia <span className="text-[0.8rem] md:text-[1rem] leading-none">›</span>
          </button>
        </div>

        {showSearch && (
          <div className="flex-1 max-w-[400px] mx-4 hidden md:block">
            <div className="bg-[#f1f5f9] rounded-full px-4 py-2 relative flex items-center gap-3">
              <Search className="text-[#64748b]" size={18} />
              <input 
                type="text" 
                placeholder="Search Posters" 
                className="flex-1 border-none bg-transparent outline-none text-[0.95rem]"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <Mic className="text-[#ef4444]" size={18} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 md:gap-4">
          <button 
            onClick={openCustomPosterEditor}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-[0.7rem] font-black uppercase tracking-widest transition-all border border-white/20 hidden sm:flex items-center gap-2 cursor-pointer"
          >
            <Plus size={14} /> Create Custom
          </button>

          <div 
            className="relative text-white flex items-center cursor-pointer"
            onClick={() => navigate('/whats-new')}
          >
             <Bell size={20} />
             <span className="absolute -top-1.5 -right-1.5 bg-[#3b82f6] text-white px-1 ml-0.5 rounded-[10px] text-[0.55rem] font-bold border-[1.2px] border-[#b91c1c]">9+</span>
          </div>
          
          <div 
            className="relative text-white flex flex-col items-center cursor-pointer group"
            onClick={() => navigate('/calendar')}
          >
             <CalendarCheck size={20} />
             <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#3b82f6] text-white px-1.5 py-0.2 rounded-sm text-[0.45rem] font-bold uppercase whitespace-nowrap border-[1px] border-[#b91c1c]">New</div>
          </div>
          
          <div className="relative group">
             <div className="relative text-white flex items-center cursor-pointer p-1">
                <HelpCircle size={20} />
             </div>
             
             {/* Header Help Dropdown */}
             <div className="absolute top-[120%] right-0 w-[200px] bg-white rounded-2xl shadow-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[1001] translate-y-2 group-hover:translate-y-0 border border-slate-100">
                <button 
                  onClick={() => navigate('/help')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 border-none transition-colors cursor-pointer"
                >
                   <div className="w-8 h-8 bg-slate-100 group-hover:bg-red-100 rounded-lg flex items-center justify-center">
                      <HelpCircle size={16} />
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-tight">Help Center</p>
                      <p className="text-[8px] font-bold opacity-60">Guides & Tutorials</p>
                   </div>
                </button>

                <button 
                  onClick={() => navigate('/help')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 border-none transition-colors cursor-pointer"
                >
                   <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Mic size={16} />
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-tight">Support</p>
                      <p className="text-[8px] font-bold opacity-60">Connect with us</p>
                   </div>
                </button>

                <div className="h-[1px] bg-slate-100 my-1 mx-2" />

                <button 
                  onClick={() => navigate('/terms')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 border-none transition-colors cursor-pointer"
                >
                   <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      <CalendarCheck size={16} />
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-tight">Terms</p>
                   </div>
                </button>
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CommonHeader;

